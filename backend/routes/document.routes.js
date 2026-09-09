import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import Document from '../models/Document.js';
import Case from '../models/Case.js';
import Activity from '../models/Activity.js';
import crypto from 'crypto';
import fs from 'fs';

const router = express.Router();

// Upload document
router.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Calculate SHA-256 hash
    const fileBuffer = fs.readFileSync(req.file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const document = new Document({
      name: req.body.name || req.file.originalname,
      originalName: req.file.originalname,
      description: req.body.description,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      path: req.file.path,
      hash: hash,
      hashAlgorithm: 'SHA-256',
      caseId: req.body.caseId,
      uploadedBy: req.user._id,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      chainOfCustody: [{
        action: 'uploaded',
        user: req.user._id,
        details: { fileName: req.file.originalname, fileSize: req.file.size },
      }],
    });

    await document.save();

    // Update case evidence count
    await Case.findByIdAndUpdate(req.body.caseId, {
      $inc: { evidenceCount: 1 },
      $push: { documents: document._id },
    });

    await Activity.create({
      action: 'document_uploaded',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      targetType: 'document',
      targetId: document._id,
      details: { 
        fileName: req.file.originalname,
        caseId: req.body.caseId,
        hash: hash,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
});

// Get all documents
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { caseId, search } = req.query;
    const filter = {};
    if (caseId) filter.caseId = caseId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await Document.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('caseId', 'title caseNumber')
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      data: documents,
      count: documents.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get document by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('caseId', 'title caseNumber')
      .populate('chainOfCustody.user', 'firstName lastName email');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Add to chain of custody
    document.chainOfCustody.push({
      action: 'viewed',
      user: req.user._id,
      details: { viewedBy: req.user.email },
    });
    await document.save();

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
});

// Verify document hash
router.post('/:id/verify', authenticate, authorize('investigator', 'admin'), async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Read file and calculate hash
    const fileBuffer = fs.readFileSync(document.path);
    const currentHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const isVerified = currentHash === document.hash;

    // Add to chain of custody
    document.chainOfCustody.push({
      action: 'verified',
      user: req.user._id,
      details: { 
        verified: isVerified,
        expectedHash: document.hash,
        currentHash: currentHash,
      },
    });
    await document.save();

    await Activity.create({
      action: 'evidence_verified',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      targetType: 'document',
      targetId: document._id,
      details: { 
        verified: isVerified,
        fileName: document.name,
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: {
        verified: isVerified,
        expectedHash: document.hash,
        currentHash: currentHash,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete document
router.delete('/:id', authenticate, authorize('admin', 'investigator'), async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete file from storage
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    await document.deleteOne();

    // Update case
    await Case.findByIdAndUpdate(document.caseId, {
      $inc: { evidenceCount: -1 },
      $pull: { documents: document._id },
    });

    await Activity.create({
      action: 'document_deleted',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      targetType: 'document',
      targetId: req.params.id,
      details: { fileName: document.name },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
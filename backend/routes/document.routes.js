import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import Document from '../models/Document.js';
import Case from '../models/Case.js';
import Activity from '../models/Activity.js';
import crypto from 'crypto';
import fs from 'fs';

import {
  registerEvidence,
  verifyEvidence,
} from '../services/blockchain.service.js';

const router = express.Router();

// ============================================================
// UPLOAD DOCUMENT
// ============================================================
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      // --------------------------------------------------------
      // 1. Calculate SHA-256 hash of uploaded file
      // --------------------------------------------------------
      const fileBuffer = fs.readFileSync(req.file.path);

      const hash = crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');

      // --------------------------------------------------------
      // 2. Create MongoDB document
      // --------------------------------------------------------
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

        tags: req.body.tags
          ? req.body.tags.split(',')
          : [],

        chainOfCustody: [
          {
            action: 'uploaded',
            user: req.user._id,
            details: {
              fileName: req.file.originalname,
              fileSize: req.file.size,
            },
          },
        ],
      });

      // --------------------------------------------------------
      // 3. Save document in MongoDB
      // --------------------------------------------------------
      await document.save();

      // --------------------------------------------------------
      // 4. Register SHA-256 hash on blockchain
      // --------------------------------------------------------
      try {
        const blockchainResult = await registerEvidence(
          document._id.toString(),
          hash,
          1
        );

        document.blockchain = {
          transactionHash:
            blockchainResult.transactionHash,

          blockNumber:
            blockchainResult.blockNumber.toString(),

          contractAddress:
            process.env.BLOCKCHAIN_CONTRACT_ADDRESS,

          network: 'hardhat-local',

          status: 'confirmed',

          registeredAt: new Date(),
        };

        await document.save();

        console.log(
          'Blockchain registration successful:',
          blockchainResult.transactionHash
        );
      } catch (blockchainError) {
        console.error(
          'Blockchain registration failed:',
          blockchainError
        );

        document.blockchain = {
          transactionHash: null,
          blockNumber: null,

          contractAddress:
            process.env.BLOCKCHAIN_CONTRACT_ADDRESS,

          network: 'hardhat-local',

          status: 'failed',

          registeredAt: null,
        };

        await document.save();
      }

      // --------------------------------------------------------
      // 5. Update case evidence count
      // --------------------------------------------------------
      await Case.findByIdAndUpdate(
        req.body.caseId,
        {
          $inc: {
            evidenceCount: 1,
          },

          $push: {
            documents: document._id,
          },
        }
      );

      // --------------------------------------------------------
      // 6. Create activity log
      // --------------------------------------------------------
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

          blockchainTransaction:
            document.blockchain?.transactionHash || null,

          blockchainStatus:
            document.blockchain?.status || 'failed',
        },

        ipAddress: req.ip,

        userAgent: req.headers['user-agent'],
      });

      // --------------------------------------------------------
      // 7. Send response
      // --------------------------------------------------------
      res.status(201).json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET ALL DOCUMENTS
// ============================================================
router.get(
  '/',
  authenticate,
  async (req, res, next) => {
    try {
      const { caseId, search } = req.query;

      const filter = {};

      if (caseId) {
        filter.caseId = caseId;
      }

      if (search) {
        filter.$or = [
          {
            name: {
              $regex: search,
              $options: 'i',
            },
          },

          {
            originalName: {
              $regex: search,
              $options: 'i',
            },
          },
        ];
      }

      const documents = await Document.find(filter)
        .populate(
          'uploadedBy',
          'firstName lastName email'
        )

        .populate(
          'caseId',
          'title caseNumber'
        )

        .sort({
          uploadedAt: -1,
        });

      res.json({
        success: true,
        data: documents,
        count: documents.length,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// GET DOCUMENT BY ID
// ============================================================
router.get(
  '/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const document = await Document.findById(
        req.params.id
      )
        .populate(
          'uploadedBy',
          'firstName lastName email'
        )

        .populate(
          'caseId',
          'title caseNumber'
        )

        .populate(
          'chainOfCustody.user',
          'firstName lastName email'
        );

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      // Add view activity to chain of custody
      document.chainOfCustody.push({
        action: 'viewed',

        user: req.user._id,

        details: {
          viewedBy: req.user.email,
        },
      });

      await document.save();

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// VERIFY DOCUMENT
// ============================================================
router.post(
  '/:id/verify',
  authenticate,
  authorize('investigator', 'admin'),

  async (req, res, next) => {
    try {
      const document = await Document.findById(
        req.params.id
      );

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      // --------------------------------------------------------
      // 1. Read current file
      // --------------------------------------------------------
      const fileBuffer = fs.readFileSync(
        document.path
      );

      // --------------------------------------------------------
      // 2. Calculate current SHA-256
      // --------------------------------------------------------
      const currentHash = crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');

      // --------------------------------------------------------
      // 3. Compare with MongoDB hash
      // --------------------------------------------------------
      const mongoVerified =
        currentHash === document.hash;

      // --------------------------------------------------------
      // 4. Compare with blockchain hash/history
      // --------------------------------------------------------
      let blockchainVerified = false;

      try {
        blockchainVerified =
          await verifyEvidence(
            document._id.toString(),
            currentHash
          );
      } catch (blockchainError) {
        console.error(
          'Blockchain verification failed:',
          blockchainError
        );
      }

      // --------------------------------------------------------
      // 5. Final verification result
      // --------------------------------------------------------
      const isVerified =
        mongoVerified &&
        blockchainVerified;

      // --------------------------------------------------------
      // 6. Add verification to chain of custody
      // --------------------------------------------------------
      document.chainOfCustody.push({
        action: 'verified',

        user: req.user._id,

        details: {
          verified: isVerified,

          mongoVerified: mongoVerified,

          blockchainVerified:
            blockchainVerified,

          expectedHash: document.hash,

          currentHash: currentHash,
        },
      });

      await document.save();

      // --------------------------------------------------------
      // 7. Activity log
      // --------------------------------------------------------
      await Activity.create({
        action: 'evidence_verified',

        user: req.user._id,

        userEmail: req.user.email,

        userRole: req.user.role,

        targetType: 'document',

        targetId: document._id,

        details: {
          verified: isVerified,

          mongoVerified: mongoVerified,

          blockchainVerified:
            blockchainVerified,

          fileName: document.name,
        },

        ipAddress: req.ip,

        userAgent: req.headers['user-agent'],
      });

      // --------------------------------------------------------
      // 8. Response
      // --------------------------------------------------------
      res.json({
        success: true,

        data: {
          verified: isVerified,

          mongoVerified: mongoVerified,

          blockchainVerified:
            blockchainVerified,

          expectedHash: document.hash,

          currentHash: currentHash,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================
// DELETE DOCUMENT
// ============================================================
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'investigator'),

  async (req, res, next) => {
    try {
      const document = await Document.findById(
        req.params.id
      );

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      // Delete physical file
      if (fs.existsSync(document.path)) {
        fs.unlinkSync(document.path);
      }

      // Delete MongoDB document
      await document.deleteOne();

      // Update case
      await Case.findByIdAndUpdate(
        document.caseId,
        {
          $inc: {
            evidenceCount: -1,
          },

          $pull: {
            documents: document._id,
          },
        }
      );

      // Activity log
      await Activity.create({
        action: 'document_deleted',

        user: req.user._id,

        userEmail: req.user.email,

        userRole: req.user.role,

        targetType: 'document',

        targetId: req.params.id,

        details: {
          fileName: document.name,
        },

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
  }
);

export default router;
import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import Case from '../models/Case.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// Get all cases
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, priority, assignedTo } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const cases = await Case.find(filter)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: cases,
      count: cases.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get case by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('documents');
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }
    
    res.json({
      success: true,
      data: caseData,
    });
  } catch (error) {
    next(error);
  }
});

// Create case
router.post('/', authenticate, authorize('officer', 'investigator', 'admin'), async (req, res, next) => {
  try {
    const caseData = {
      ...req.body,
      createdBy: req.user._id,
    };
    
    const newCase = new Case(caseData);
    await newCase.save();

    await Activity.create({
      action: 'case_created',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      targetType: 'case',
      targetId: newCase._id,
      details: { caseNumber: newCase.caseNumber },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    
    res.status(201).json({
      success: true,
      data: newCase,
    });
  } catch (error) {
    next(error);
  }
});

// Update case
router.put('/:id', authenticate, authorize('officer', 'investigator', 'admin'), async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    await Activity.create({
      action: 'case_updated',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      targetType: 'case',
      targetId: updatedCase._id,
      details: { caseNumber: updatedCase.caseNumber },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      data: updatedCase,
    });
  } catch (error) {
    next(error);
  }
});

// Delete case
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const caseData = await Case.findById(req.params.id);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: 'Case not found',
      });
    }

    await caseData.deleteOne();

    await Activity.create({
      action: 'case_deleted',
      user: req.user._id,
      userEmail: req.user.email,
      userRole: req.user.role,
      targetType: 'case',
      targetId: req.params.id,
      details: { caseNumber: caseData.caseNumber },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Case deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get case statistics
router.get('/stats/overview', authenticate, async (req, res, next) => {
  try {
    const total = await Case.countDocuments();
    const active = await Case.countDocuments({ status: 'active' });
    const pending = await Case.countDocuments({ status: 'pending' });
    const closed = await Case.countDocuments({ status: 'closed' });
    const archived = await Case.countDocuments({ status: 'archived' });

    const priorityStats = await Case.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        pending,
        closed,
        archived,
        priority: priorityStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
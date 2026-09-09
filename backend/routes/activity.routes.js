import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import Activity from '../models/Activity.js';

const router = express.Router();

// Get activities with pagination
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { limit = 50, page = 1, action, userId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.user = userId;

    const activities = await Activity.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Activity.countDocuments(filter);

    res.json({
      success: true,
      data: activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get activity by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('user', 'firstName lastName email');
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
});

// Get activity statistics
router.get('/stats/overview', authenticate, async (req, res, next) => {
  try {
    const total = await Activity.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = await Activity.countDocuments({
      timestamp: { $gte: today },
    });

    const actionStats = await Activity.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        total,
        today: todayActivities,
        topActions: actionStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
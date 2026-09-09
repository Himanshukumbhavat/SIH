import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import User from '../models/User.js';

const router = express.Router();

// Get current user profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password -otpCode -otpExpires -refreshTokens -twoFactorSecret')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticate, authorize('admin', 'investigator'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otpCode -otpExpires -refreshTokens -twoFactorSecret');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { role, department, badgeNumber, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (role) user.role = role;
    if (department) user.department = department;
    if (badgeNumber) user.badgeNumber = badgeNumber;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
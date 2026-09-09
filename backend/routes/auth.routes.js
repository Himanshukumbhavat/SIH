import express from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import authService from '../services/auth.service.js';
import otpService from '../services/otp.service.js';
import twoFactorService from '../services/twofactor.service.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  };
};

// Register
router.post('/register', validate([
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('role').optional().isIn(['viewer', 'officer', 'investigator', 'admin']),
]), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, department, badgeNumber } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: role || 'viewer',
      department,
      badgeNumber,
    });

    await user.save();

    // Send OTP for verification
    await otpService.sendVerificationOTP(user);

    await Activity.create({
      action: 'user_created',
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      targetType: 'user',
      targetId: user._id,
      details: { registration: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email with the OTP sent.',
      data: {
        userId: user._id,
        email: user.email,
        requiresOTP: true,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Verify Email with OTP
router.post('/verify-email', validate([
  body('email').isEmail().normalizeEmail(),
  body('otpCode').isLength({ min: 6, max: 6 }),
]), async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const isValid = await otpService.verifyOTP(user, otpCode);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    await Activity.create({
      action: 'otp_verified',
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      details: { emailVerified: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Resend OTP
router.post('/resend-otp', validate([
  body('email').isEmail().normalizeEmail(),
]), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    await otpService.sendVerificationOTP(user);

    res.json({
      success: true,
      message: 'OTP resent successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate([
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
]), async (req, res, next) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked. Please try again later.',
        lockedUntil: user.lockedUntil,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    await user.resetLoginAttempts();

    if (!user.isVerified) {
      await otpService.sendVerificationOTP(user);
      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent to your email.',
        requiresVerification: true,
      });
    }

    // Check 2FA
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          success: true,
          message: '2FA required',
          requiresTwoFactor: true,
          userId: user._id,
        });
      }

      const isValid2FA = twoFactorService.verifyToken(user, twoFactorCode);
      if (!isValid2FA) {
        return res.status(401).json({
          success: false,
          message: 'Invalid 2FA code',
        });
      }
    }

    // Generate tokens
    const tokens = await authService.generateTokens(user);

    user.lastLogin = new Date();
    await user.save();

    await Activity.create({
      action: 'login',
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      details: { 
        twoFactorUsed: user.twoFactorEnabled,
        method: 'password',
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const userData = user.toObject();
    delete userData.password;
    delete userData.otpCode;
    delete userData.otpExpires;
    delete userData.twoFactorSecret;
    delete userData.refreshTokens;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Setup 2FA
router.post('/setup-2fa', authenticate, async (req, res, next) => {
  try {
    const user = req.user;

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled',
      });
    }

    const { secret, qrCode } = await twoFactorService.generateSecret(user);

    res.json({
      success: true,
      data: {
        secret,
        qrCode,
        manualEntry: secret,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Enable 2FA
router.post('/enable-2fa', authenticate, validate([
  body('code').isLength({ min: 6, max: 6 }),
]), async (req, res, next) => {
  try {
    const user = req.user;
    const { code } = req.body;

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA not set up. Please setup 2FA first.',
      });
    }

    const isValid = twoFactorService.verifyToken(user, code);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code',
      });
    }

    user.twoFactorEnabled = true;
    await user.save();

    await Activity.create({
      action: 'two_factor_enabled',
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      details: { enabled: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: '2FA enabled successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Disable 2FA
router.post('/disable-2fa', authenticate, validate([
  body('code').isLength({ min: 6, max: 6 }),
]), async (req, res, next) => {
  try {
    const user = req.user;
    const { code } = req.body;

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled',
      });
    }

    const isValid = twoFactorService.verifyToken(user, code);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2FA code',
      });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    await Activity.create({
      action: 'two_factor_disabled',
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      details: { disabled: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: '2FA disabled successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Forgot Password
router.post('/forgot-password', validate([
  body('email').isEmail().normalizeEmail(),
]), async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    await otpService.sendPasswordResetOTP(user);

    res.json({
      success: true,
      message: 'Password reset OTP sent to your email',
    });
  } catch (error) {
    next(error);
  }
});

// Reset Password
router.post('/reset-password', validate([
  body('email').isEmail().normalizeEmail(),
  body('otpCode').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 }),
]), async (req, res, next) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await otpService.verifyOTP(user, otpCode);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    await Activity.create({
      action: 'password_changed',
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      details: { passwordReset: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh-token', validate([
  body('refreshToken').notEmpty(),
]), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: tokens,
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const { refreshToken } = req.body;

    if (refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(
        rt => rt.token !== refreshToken
      );
      await user.save();
    }

    await Activity.create({
      action: 'logout',
      user: user._id,
      userEmail: user.email,
      userRole: user.role,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
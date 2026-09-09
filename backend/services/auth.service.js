import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );
  }

  async generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt,
    });
    await user.save();

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if refresh token exists
      const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
      if (!tokenExists) {
        throw new Error('Invalid refresh token');
      }

      // Remove old refresh token
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
      
      // Generate new tokens
      const tokens = await this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async revokeRefreshToken(userId, refreshToken) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    await user.save();
  }
}

export default new AuthService();
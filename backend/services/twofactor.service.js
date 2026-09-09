import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import dotenv from 'dotenv';

dotenv.config();

class TwoFactorService {
  async generateSecret(user) {
    const secret = speakeasy.generateSecret({
      name: `${process.env.TOTP_ISSUER}:${user.email}`,
      issuer: process.env.TOTP_ISSUER,
    });

    // Save secret temporarily
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR Code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  verifyToken(user, token) {
    if (!user.twoFactorSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: parseInt(process.env.TOTP_WINDOW) || 2,
      step: parseInt(process.env.TOTP_STEP) || 30,
    });
  }

  generateBackupCodes() {
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return backupCodes;
  }
}

export default new TwoFactorService();
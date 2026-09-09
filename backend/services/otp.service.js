import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

class OTPService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  generateOTP() {
    const length = parseInt(process.env.OTP_LENGTH) || 6;
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += crypto.randomInt(0, 10).toString();
    }
    return otp;
  }

  async sendOTPEmail(email, otp, type = 'verification') {
    const subject = type === 'verification' 
      ? 'Verify your email - DEMS' 
      : 'Password Reset - DEMS';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a202c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f7fafc; }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #2b6cb0;
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 2px dashed #e2e8f0;
            letter-spacing: 8px;
          }
          .footer { text-align: center; padding: 20px; color: #718096; font-size: 14px; }
          .warning { color: #e53e3e; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Digital Evidence Management System</h1>
          </div>
          <div class="content">
            <h2>${type === 'verification' ? 'Email Verification' : 'Password Reset'}</h2>
            <p>Hello,</p>
            <p>${type === 'verification' 
              ? 'Thank you for registering with DEMS. Please use the following OTP to verify your email address:' 
              : 'We received a request to reset your password. Use the following OTP to proceed:'}</p>
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>.</p>
            <p class="warning">⚠️ If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} DEMS. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html,
    });
  }

  async sendVerificationOTP(user) {
    const otp = this.generateOTP();
    const expiresInMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    await user.save();

    await this.sendOTPEmail(user.email, otp, 'verification');
  }

  async sendPasswordResetOTP(user) {
    const otp = this.generateOTP();
    const expiresInMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
    
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    await user.save();

    await this.sendOTPEmail(user.email, otp, 'reset');
  }

  async verifyOTP(user, otpCode) {
    if (!user.otpCode || !user.otpExpires) {
      return false;
    }

    if (user.otpExpires < new Date()) {
      return false;
    }

    return user.otpCode === otpCode;
  }
}

export default new OTPService();
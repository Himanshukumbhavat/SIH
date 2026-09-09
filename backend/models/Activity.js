import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'case_created',
      'case_updated',
      'case_deleted',
      'document_uploaded',
      'document_viewed',
      'document_downloaded',
      'document_deleted',
      'evidence_verified',
      'user_created',
      'user_updated',
      'user_deleted',
      'permission_changed',
      'otp_verified',
      'two_factor_enabled',
      'two_factor_disabled',
      'password_changed',
    ],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  userEmail: {
    type: String,
  },
  userRole: {
    type: String,
  },
  targetType: {
    type: String,
    enum: ['case', 'document', 'user', 'system'],
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
activitySchema.index({ timestamp: -1 });
activitySchema.index({ user: 1 });
activitySchema.index({ action: 1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
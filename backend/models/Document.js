import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  fileType: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  hashAlgorithm: {
    type: String,
    default: 'SHA-256',
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  tags: [String],
  isEncrypted: {
    type: Boolean,
    default: false,
  },
  encryptionKey: {
    type: String,
    default: null,
  },
  chainOfCustody: [{
    action: {
      type: String,
      enum: ['uploaded', 'viewed', 'downloaded', 'transferred', 'verified'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: mongoose.Schema.Types.Mixed,
  }],
  versions: [{
    version: Number,
    hash: String,
    path: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    changes: String,
  }],
}, {
  timestamps: true,
});

const Document = mongoose.model('Document', documentSchema);
export default Document;
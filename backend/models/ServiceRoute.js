const mongoose = require('mongoose');

const serviceRouteSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  serviceKey: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  gatewayName: {
    type: String,
    required: true,
    trim: true
  },
  secretHash: {
    type: String,
    required: true,
    trim: true
  },
  signatureHeader: {
    type: String,
    required: true,
    trim: true
  },
  callbackUrl: {
    type: String,
    trim: true
  },
  targetDatabaseURI: {
    type: String,
    required: true,
    trim: true
  },
  targetCollection: {
    type: String,
    required: true,
    trim: true
  },
  actionType: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServiceRoute', serviceRouteSchema);

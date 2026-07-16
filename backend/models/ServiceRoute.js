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
    enum: ['FUND_WALLET', 'UPGRADE_PLAN'],
    required: true
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

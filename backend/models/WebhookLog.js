const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    trim: true
  },
  serviceKey: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    trim: true
  },
  payload: {
    type: Object,
    required: true
  },
  errorMessage: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WebhookLog', webhookLogSchema);

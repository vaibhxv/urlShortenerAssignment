const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  longUrl: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true
  },
  alias: {
    type: String,
    unique: true
  },
  topic: String,
  clicks: {
    type: Number,
    default: 0
  },
  analytics: [{
    timestamp: Date,
    userAgent: String,
    ipAddress: String,
    location: Object,
    osType: String,
    deviceType: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Url', urlSchema);
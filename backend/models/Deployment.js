const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'deploying'],
    default: 'online'
  },
  version: {
    type: String,
    default: 'v1.0.0',
    trim: true
  },
  lastDeploy: {
    type: String,
    default: () => new Date().toISOString().replace('T', ' ').substring(0, 16)
  },
  logs: {
    type: [String],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Deployment', deploymentSchema);

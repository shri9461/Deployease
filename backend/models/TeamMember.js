const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['guest', 'operator', 'admin'],
    default: 'guest'
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  initials: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);

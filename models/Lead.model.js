const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  interestedIn: {
    // Could be builder, project, or property unit, optional references
    builder: { type: mongoose.Schema.Types.ObjectId, ref: 'BuilderProfile' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'phone', 'email', 'walk-in', 'advertisement', 'other'],
    default: 'website',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'not interested', 'converted', 'lost'],
    default: 'new',
  },
  assignedTo: {
    // Which directBuilder or admin is handling this lead
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: [
    {
      note: String,
      date: { type: Date, default: Date.now },
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lead', leadSchema);

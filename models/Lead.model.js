const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'interested', 'negotiating', 'closed', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 1000
  },
  offerPrice: {
    type: Number, // if the buyer is making an offer
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', LeadSchema);

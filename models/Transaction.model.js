const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // who paid or made the transaction
  builder: { type: mongoose.Schema.Types.ObjectId, ref: 'BuilderProfile' },    // related builder
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },             // property/unit booked or transacted
  amount: { type: Number, required: true },
  transactionDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'net_banking', 'upi', 'cash', 'other'], default: 'other' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);

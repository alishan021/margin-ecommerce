const mongoose = require('mongoose');

// A payment-provider backed request to add money to a wallet. Amounts are
// always stored in the provider's smallest currency unit (paise for INR).
const walletTopUpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    index: true,
  },
  amount: { type: Number, required: true, min: 1 },
  currency: { type: String, required: true, default: 'INR' },
  provider: { type: String, required: true, default: 'razorpay' },
  providerOrderId: { type: String, required: true, unique: true },
  providerPaymentId: { type: String, unique: true, sparse: true },
  status: {
    type: String,
    enum: ['pending', 'credited', 'failed'],
    default: 'pending',
    index: true,
  },
  creditedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('WalletTopUp', walletTopUpSchema);

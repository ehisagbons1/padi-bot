const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['airtime', 'data', 'card_purchase', 'giftcard_sale', 'wallet_funding', 'wallet_withdrawal'],
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'NGN',
  },
  details: {
    // For airtime/data
    recipientNumber: String,
    network: String,
    dataBundle: String,
    
    // For gift cards
    cardType: String,
    cardValue: String,
    cardImages: [String], // URLs or file paths
    cardCode: String,
    reviewNotes: String, // Admin review notes
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    reviewedAt: Date,
    
    // For purchases
    productName: String,
    quantity: Number,
    
    // Provider details
    provider: String,
    providerReference: String,
    providerResponse: mongoose.Schema.Types.Mixed,
  },
  payment: {
    method: {
      type: String,
      enum: ['wallet', 'card', 'bank_transfer', 'paystack', 'flutterwave'],
    },
    reference: String,
    gateway: String,
    gatewayReference: String,
    paidAt: Date,
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
  },
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Index for better query performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ phoneNumber: 1, createdAt: -1 });
transactionSchema.index({ status: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);



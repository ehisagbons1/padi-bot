const mongoose = require('mongoose');

const giftCardProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  rates: [{
    value: {
      type: Number,
      required: true, // USD value
    },
    rate: {
      type: Number,
      required: true, // NGN rate
    },
  }],
  // Default rate calculation for values not in list
  defaultRate: {
    type: Number,
    default: 3.5, // Multiplier (e.g., $1 = ₦3.5)
  },
  requirements: {
    requiresImage: { type: Boolean, default: true },
    requiresCode: { type: Boolean, default: true },
    requiresReceipt: { type: Boolean, default: false },
    minImages: { type: Number, default: 1 },
    maxImages: { type: Number, default: 5 },
  },
  notes: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Get rate for specific value
giftCardProductSchema.methods.getRate = function(value) {
  // Find exact rate
  const rateObj = this.rates.find(r => r.value === value);
  if (rateObj) {
    return rateObj.rate;
  }
  // Use default rate
  return Math.floor(value * this.defaultRate);
};

// Index for faster queries
giftCardProductSchema.index({ code: 1, enabled: 1 });

module.exports = mongoose.model('GiftCardProduct', giftCardProductSchema);


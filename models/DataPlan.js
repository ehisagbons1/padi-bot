const mongoose = require('mongoose');

const dataPlanSchema = new mongoose.Schema({
  network: {
    type: String,
    required: true,
    enum: ['mtn', 'glo', 'airtel', '9mobile'],
  },
  name: {
    type: String,
    required: true, // e.g., "1GB - 30 Days"
  },
  code: {
    type: String,
    required: true, // Provider code (e.g., "mtn-1gb-30days")
  },
  dataSize: {
    type: String,
    required: true, // e.g., "1GB", "500MB"
  },
  validity: {
    type: String,
    required: true, // e.g., "30 Days", "7 Days"
  },
  price: {
    type: Number,
    required: true, // Price in NGN
  },
  costPrice: {
    type: Number,
    required: true, // What you pay to provider
  },
  profit: {
    type: Number,
    default: function() {
      return this.price - this.costPrice;
    },
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  // Provider details
  provider: {
    type: String,
    enum: ['vtpass', 'shago', 'manual'],
    default: 'vtpass',
  },
  providerCode: {
    type: String, // Specific code used by provider API
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

// Calculate profit before saving
dataPlanSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('costPrice')) {
    this.profit = this.price - this.costPrice;
  }
  next();
});

// Index for faster queries
dataPlanSchema.index({ network: 1, enabled: 1, displayOrder: 1 });

module.exports = mongoose.model('DataPlan', dataPlanSchema);


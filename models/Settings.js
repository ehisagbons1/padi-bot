const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Bot Configuration
  bot: {
    name: {
      type: String,
      default: 'WhatsApp Commerce Bot',
    },
    welcomeMessage: {
      type: String,
      default: '👋 Welcome to WhatsApp Commerce Bot!',
    },
    supportPhone: {
      type: String,
      default: '+234-XXX-XXX-XXXX',
    },
    supportEmail: {
      type: String,
      default: 'support@example.com',
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    currencySymbol: {
      type: String,
      default: '₦',
    },
  },

  // Service Status
  services: {
    airtime: {
      enabled: { type: Boolean, default: true },
      commission: { type: Number, default: 2 }, // Percentage
    },
    data: {
      enabled: { type: Boolean, default: true },
      commission: { type: Number, default: 3 },
    },
    giftCard: {
      enabled: { type: Boolean, default: true },
      autoApprove: { type: Boolean, default: false },
      maxValue: { type: Number, default: 500 }, // USD
    },
    wallet: {
      enabled: { type: Boolean, default: true },
      minFunding: { type: Number, default: 100 },
      maxFunding: { type: Number, default: 500000 },
    },
  },

  // Transaction Limits
  limits: {
    airtime: {
      min: { type: Number, default: 50 },
      max: { type: Number, default: 10000 },
    },
    data: {
      min: { type: Number, default: 100 },
      max: { type: Number, default: 20000 },
    },
  },

  // Notifications
  notifications: {
    emailOnGiftCard: { type: Boolean, default: true },
    emailOnLargeTransaction: { type: Boolean, default: true },
    largeTransactionThreshold: { type: Number, default: 50000 },
  },

  // Maintenance
  maintenance: {
    enabled: { type: Boolean, default: false },
    message: {
      type: String,
      default: '🔧 System maintenance in progress. Please try again later.',
    },
  },

  updatedBy: {
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

// Only allow one settings document
settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);


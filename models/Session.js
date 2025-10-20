const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    index: true,
  },
  currentState: {
    type: String,
    default: 'main_menu',
  },
  currentFlow: {
    type: String,
    enum: ['airtime', 'data', 'card_purchase', 'giftcard_sale', 'wallet', 'profile', 'registration', null],
    default: null,
  },
  flow: {
    type: String,
    enum: ['airtime', 'data', 'card_purchase', 'giftcard_sale', 'wallet', 'profile', 'registration', null],
    default: null,
  },
  state: {
    type: String,
    default: 'main_menu',
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  history: [{
    state: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    data: mongoose.Schema.Types.Mixed,
  }],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    index: true,
  },
  lastInteraction: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Automatically remove expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to update session
sessionSchema.methods.updateState = function(newState, newData = {}) {
  this.history.push({
    state: this.currentState,
    data: { ...this.data },
    timestamp: new Date(),
  });
  
  this.currentState = newState;
  this.data = { ...this.data, ...newData };
  this.lastInteraction = Date.now();
  this.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Reset expiry
  
  return this.save();
};

// Method to reset session
sessionSchema.methods.reset = function() {
  this.currentState = 'main_menu';
  this.currentFlow = null;
  this.data = {};
  this.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);






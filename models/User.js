const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  whatsappNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: '',
  },
  wallet: {
    balance: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    }
  },
  profile: {
    email: String,
    dateOfBirth: Date,
  },
  statistics: {
    totalTransactions: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
    }
  },
  preferences: {
    savedNumbers: [{
      label: String,
      number: String,
    }],
    favoriteNetworks: [String],
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'blocked'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

// Update last active on each interaction
userSchema.methods.updateLastActive = function() {
  this.lastActive = Date.now();
  return this.save();
};

// Add to wallet
userSchema.methods.addToWallet = function(amount) {
  this.wallet.balance += amount;
  return this.save();
};

// Deduct from wallet
userSchema.methods.deductFromWallet = function(amount) {
  if (this.wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }
  this.wallet.balance -= amount;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);



const Admin = require('../models/Admin');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const GiftCardProduct = require('../models/GiftCardProduct');
const DataPlan = require('../models/DataPlan');

class AdminController {
  // ==================== AUTH ====================
  
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      // Find admin
      const admin = await Admin.findOne({ username: username.toLowerCase() });
      
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Validate password
      if (!admin.validatePassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if suspended
      if (admin.status !== 'active') {
        return res.status(403).json({ error: 'Account suspended' });
      }

      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Create session
      req.session.adminId = admin._id;

      res.json({
        message: 'Login successful',
        admin: admin.toJSON(),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async logout(req, res) {
    try {
      req.session.destroy();
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  async getProfile(req, res) {
    try {
      res.json({ admin: req.admin.toJSON() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  // ==================== DASHBOARD ====================

  async getDashboardStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalUsers,
        newUsersToday,
        totalTransactions,
        todayTransactions,
        pendingGiftCards,
        totalRevenue,
        todayRevenue,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: today } }),
        Transaction.countDocuments({ status: 'completed' }),
        Transaction.countDocuments({ 
          status: 'completed',
          createdAt: { $gte: today },
        }),
        Transaction.countDocuments({ 
          type: 'giftcard_sale',
          status: 'processing',
        }),
        Transaction.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
          { 
            $match: { 
              status: 'completed',
              createdAt: { $gte: today },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

      // Recent transactions
      const recentTransactions = await Transaction.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'phoneNumber name')
        .lean();

      res.json({
        stats: {
          users: {
            total: totalUsers,
            newToday: newUsersToday,
          },
          transactions: {
            total: totalTransactions,
            today: todayTransactions,
            pending: pendingGiftCards,
          },
          revenue: {
            total: totalRevenue[0]?.total || 0,
            today: todayRevenue[0]?.total || 0,
          },
        },
        recentTransactions,
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
  }

  // ==================== USERS ====================

  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      
      const query = {};
      if (search) {
        query.$or = [
          { phoneNumber: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
        ];
      }
      if (status) {
        query.status = status;
      }

      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();

      const total = await User.countDocuments(query);

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId).lean();
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get user transactions
      const transactions = await Transaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      res.json({
        user,
        transactions,
      });
    } catch (error) {
      console.error('Get user details error:', error);
      res.status(500).json({ error: 'Failed to get user details' });
    }
  }

  async updateUserWallet(req, res) {
    try {
      const { userId } = req.params;
      const { action, amount, note } = req.body;

      if (!['credit', 'debit'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Perform action
      if (action === 'credit') {
        await user.addToWallet(amount);
      } else {
        if (user.wallet.balance < amount) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }
        await user.deductFromWallet(amount);
      }

      // Create transaction record
      await Transaction.create({
        user: user._id,
        phoneNumber: user.phoneNumber,
        type: action === 'credit' ? 'wallet_funding' : 'wallet_withdrawal',
        status: 'completed',
        amount: amount,
        details: {
          note: note || `Manual ${action} by admin`,
          adminId: req.admin._id,
          adminName: req.admin.username,
        },
        payment: {
          method: 'admin',
        },
      });

      res.json({
        message: `Wallet ${action === 'credit' ? 'credited' : 'debited'} successfully`,
        newBalance: user.wallet.balance,
      });
    } catch (error) {
      console.error('Update wallet error:', error);
      res.status(500).json({ error: 'Failed to update wallet' });
    }
  }

  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!['active', 'suspended', 'blocked'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User status updated', user });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }

  // ==================== TRANSACTIONS ====================

  async getTransactions(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        type, 
        status, 
        startDate, 
        endDate,
        search,
      } = req.query;

      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      if (search) {
        query.phoneNumber = { $regex: search, $options: 'i' };
      }

      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('user', 'phoneNumber name')
        .lean();

      const total = await Transaction.countDocuments(query);

      res.json({
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }

  async getTransactionDetails(req, res) {
    try {
      const { transactionId } = req.params;

      const transaction = await Transaction.findById(transactionId)
        .populate('user', 'phoneNumber name email wallet')
        .populate('details.reviewedBy', 'username')
        .lean();

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({ transaction });
    } catch (error) {
      console.error('Get transaction details error:', error);
      res.status(500).json({ error: 'Failed to get transaction details' });
    }
  }

  // ==================== GIFT CARDS ====================

  async getPendingGiftCards(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;

      const giftCards = await Transaction.find({
        type: 'giftcard_sale',
        status: 'processing',
      })
        .sort({ createdAt: 1 }) // Oldest first
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('user', 'phoneNumber name wallet')
        .lean();

      const total = await Transaction.countDocuments({
        type: 'giftcard_sale',
        status: 'processing',
      });

      res.json({
        giftCards,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get pending gift cards error:', error);
      res.status(500).json({ error: 'Failed to get pending gift cards' });
    }
  }

  async approveGiftCard(req, res) {
    try {
      const { transactionId } = req.params;
      const { note } = req.body;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.type !== 'giftcard_sale') {
        return res.status(400).json({ error: 'Not a gift card transaction' });
      }

      if (transaction.status !== 'processing') {
        return res.status(400).json({ error: 'Transaction already processed' });
      }

      // Get user
      const user = await User.findById(transaction.user);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Credit wallet
      await user.addToWallet(transaction.amount);

      // Update transaction
      transaction.status = 'completed';
      transaction.details.reviewNotes = note || 'Approved by admin';
      transaction.details.reviewedBy = req.admin._id;
      transaction.details.reviewedAt = new Date();
      await transaction.save();

      // Update user stats
      user.statistics.totalTransactions += 1;
      user.statistics.totalEarned += transaction.amount;
      await user.save();

      res.json({
        message: 'Gift card approved successfully',
        transaction,
      });
    } catch (error) {
      console.error('Approve gift card error:', error);
      res.status(500).json({ error: 'Failed to approve gift card' });
    }
  }

  async rejectGiftCard(req, res) {
    try {
      const { transactionId } = req.params;
      const { reason } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason required' });
      }

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      if (transaction.type !== 'giftcard_sale') {
        return res.status(400).json({ error: 'Not a gift card transaction' });
      }

      if (transaction.status !== 'processing') {
        return res.status(400).json({ error: 'Transaction already processed' });
      }

      // Update transaction
      transaction.status = 'failed';
      transaction.details.reviewNotes = reason;
      transaction.details.reviewedBy = req.admin._id;
      transaction.details.reviewedAt = new Date();
      transaction.error = {
        message: reason,
        code: 'REJECTED_BY_ADMIN',
      };
      await transaction.save();

      res.json({
        message: 'Gift card rejected',
        transaction,
      });
    } catch (error) {
      console.error('Reject gift card error:', error);
      res.status(500).json({ error: 'Failed to reject gift card' });
    }
  }

  // ==================== SETTINGS ====================

  async getSettings(req, res) {
    try {
      const settings = await Settings.getInstance();
      res.json({ settings });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to get settings' });
    }
  }

  async updateSettings(req, res) {
    try {
      const updates = req.body;
      
      const settings = await Settings.getInstance();
      
      // Update fields
      if (updates.bot) Object.assign(settings.bot, updates.bot);
      if (updates.services) Object.assign(settings.services, updates.services);
      if (updates.limits) Object.assign(settings.limits, updates.limits);
      if (updates.notifications) Object.assign(settings.notifications, updates.notifications);
      if (updates.maintenance) Object.assign(settings.maintenance, updates.maintenance);

      settings.updatedBy = req.admin._id;
      settings.updatedAt = new Date();
      await settings.save();

      res.json({
        message: 'Settings updated successfully',
        settings,
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  // ==================== GIFT CARD PRODUCTS ====================

  async getGiftCardProducts(req, res) {
    try {
      const products = await GiftCardProduct.find()
        .sort({ displayOrder: 1, name: 1 })
        .lean();

      res.json({ products });
    } catch (error) {
      console.error('Get gift card products error:', error);
      res.status(500).json({ error: 'Failed to get gift card products' });
    }
  }

  async createGiftCardProduct(req, res) {
    try {
      const { name, code, rates, defaultRate, enabled, requirements } = req.body;

      if (!name || !code) {
        return res.status(400).json({ error: 'Name and code required' });
      }

      const product = await GiftCardProduct.create({
        name,
        code: code.toLowerCase(),
        rates: rates || [],
        defaultRate: defaultRate || 3.5,
        enabled: enabled !== false,
        requirements: requirements || {},
        createdBy: req.admin._id,
      });

      res.json({
        message: 'Gift card product created',
        product,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Product code already exists' });
      }
      console.error('Create gift card product error:', error);
      res.status(500).json({ error: 'Failed to create gift card product' });
    }
  }

  async updateGiftCardProduct(req, res) {
    try {
      const { productId } = req.params;
      const updates = req.body;

      const product = await GiftCardProduct.findByIdAndUpdate(
        productId,
        {
          ...updates,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({
        message: 'Gift card product updated',
        product,
      });
    } catch (error) {
      console.error('Update gift card product error:', error);
      res.status(500).json({ error: 'Failed to update gift card product' });
    }
  }

  async deleteGiftCardProduct(req, res) {
    try {
      const { productId } = req.params;

      const product = await GiftCardProduct.findByIdAndDelete(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Gift card product deleted' });
    } catch (error) {
      console.error('Delete gift card product error:', error);
      res.status(500).json({ error: 'Failed to delete gift card product' });
    }
  }

  // ==================== DATA PLANS ====================

  async getDataPlans(req, res) {
    try {
      const { network } = req.query;
      
      const query = {};
      if (network) query.network = network;

      const plans = await DataPlan.find(query)
        .sort({ network: 1, displayOrder: 1 })
        .lean();

      res.json({ plans });
    } catch (error) {
      console.error('Get data plans error:', error);
      res.status(500).json({ error: 'Failed to get data plans' });
    }
  }

  async createDataPlan(req, res) {
    try {
      const { network, name, code, dataSize, validity, price, costPrice, provider } = req.body;

      if (!network || !name || !code || !price || !costPrice) {
        return res.status(400).json({ error: 'Required fields missing' });
      }

      const plan = await DataPlan.create({
        network,
        name,
        code,
        dataSize,
        validity,
        price,
        costPrice,
        provider: provider || 'vtpass',
        createdBy: req.admin._id,
      });

      res.json({
        message: 'Data plan created',
        plan,
      });
    } catch (error) {
      console.error('Create data plan error:', error);
      res.status(500).json({ error: 'Failed to create data plan' });
    }
  }

  async updateDataPlan(req, res) {
    try {
      const { planId } = req.params;
      const updates = req.body;

      const plan = await DataPlan.findByIdAndUpdate(
        planId,
        {
          ...updates,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      res.json({
        message: 'Data plan updated',
        plan,
      });
    } catch (error) {
      console.error('Update data plan error:', error);
      res.status(500).json({ error: 'Failed to update data plan' });
    }
  }

  async deleteDataPlan(req, res) {
    try {
      const { planId } = req.params;

      const plan = await DataPlan.findByIdAndDelete(planId);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      res.json({ message: 'Data plan deleted' });
    } catch (error) {
      console.error('Delete data plan error:', error);
      res.status(500).json({ error: 'Failed to delete data plan' });
    }
  }
}

module.exports = new AdminController();


const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAuth, requirePermission, requireSuperAdmin } = require('../middleware/auth');

// ==================== PUBLIC ROUTES ====================
router.post('/login', adminController.login);

// ==================== PROTECTED ROUTES (Require Login) ====================

// Auth
router.post('/logout', requireAuth, adminController.logout);
router.get('/profile', requireAuth, adminController.getProfile);

// Dashboard
router.get('/dashboard', requireAuth, adminController.getDashboardStats);

// Users
router.get('/users', requireAuth, requirePermission('manageUsers'), adminController.getUsers);
router.get('/users/:userId', requireAuth, requirePermission('manageUsers'), adminController.getUserDetails);
router.post('/users/:userId/wallet', requireAuth, requirePermission('manageUsers'), adminController.updateUserWallet);
router.patch('/users/:userId/status', requireAuth, requirePermission('manageUsers'), adminController.updateUserStatus);

// Transactions
router.get('/transactions', requireAuth, requirePermission('manageTransactions'), adminController.getTransactions);
router.get('/transactions/:transactionId', requireAuth, requirePermission('manageTransactions'), adminController.getTransactionDetails);

// Gift Cards - Approval
router.get('/giftcards/pending', requireAuth, requirePermission('approveGiftCards'), adminController.getPendingGiftCards);
router.post('/giftcards/:transactionId/approve', requireAuth, requirePermission('approveGiftCards'), adminController.approveGiftCard);
router.post('/giftcards/:transactionId/reject', requireAuth, requirePermission('approveGiftCards'), adminController.rejectGiftCard);

// Gift Card Products - Management
router.get('/giftcard-products', requireAuth, requirePermission('manageProducts'), adminController.getGiftCardProducts);
router.post('/giftcard-products', requireAuth, requirePermission('manageProducts'), adminController.createGiftCardProduct);
router.put('/giftcard-products/:productId', requireAuth, requirePermission('manageProducts'), adminController.updateGiftCardProduct);
router.delete('/giftcard-products/:productId', requireAuth, requirePermission('manageProducts'), adminController.deleteGiftCardProduct);

// Data Plans - Management
router.get('/data-plans', requireAuth, requirePermission('manageProducts'), adminController.getDataPlans);
router.post('/data-plans', requireAuth, requirePermission('manageProducts'), adminController.createDataPlan);
router.put('/data-plans/:planId', requireAuth, requirePermission('manageProducts'), adminController.updateDataPlan);
router.delete('/data-plans/:planId', requireAuth, requirePermission('manageProducts'), adminController.deleteDataPlan);

// Settings (Super Admin Only)
router.get('/settings', requireAuth, requireSuperAdmin, adminController.getSettings);
router.put('/settings', requireAuth, requireSuperAdmin, adminController.updateSettings);

// Clear cache
router.post('/clear-cache', requireAuth, (req, res) => {
  const settingsService = require('../services/settings.service');
  settingsService.clearCache();
  res.json({ message: 'Cache cleared successfully' });
});

module.exports = router;


const Admin = require('../models/Admin');

// Simple session-based authentication
const requireAuth = async (req, res, next) => {
  try {
    // Check if session exists
    if (!req.session || !req.session.adminId) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Please login to access this resource' 
      });
    }

    // Get admin from session
    const admin = await Admin.findById(req.session.adminId);
    
    if (!admin || admin.status !== 'active') {
      req.session.destroy();
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Invalid session or account suspended' 
      });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Super admin has all permissions
    if (req.admin.role === 'super_admin') {
      return next();
    }

    // Check specific permission
    if (!req.admin.permissions[permission]) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

// Check if super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: 'Only super admins can perform this action' 
    });
  }
  next();
};

module.exports = {
  requireAuth,
  requirePermission,
  requireSuperAdmin,
};


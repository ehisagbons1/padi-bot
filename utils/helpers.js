/**
 * Utility helper functions
 */

// Format currency
exports.formatCurrency = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format phone number to Nigerian standard
exports.formatPhoneNumber = (phone) => {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle different formats
  if (cleaned.startsWith('234')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('+234')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  
  return cleaned;
};

// Validate phone number (Nigerian)
exports.isValidPhoneNumber = (phone) => {
  const cleaned = exports.formatPhoneNumber(phone);
  return /^0[789]\d{9}$/.test(cleaned);
};

// Validate email
exports.isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Generate random reference
exports.generateReference = (prefix = 'REF') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Sanitize user input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Format date
exports.formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } else if (format === 'long') {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return d.toLocaleDateString();
};

// Check if session is expired
exports.isSessionExpired = (session) => {
  return new Date() > new Date(session.expiresAt);
};

// Calculate percentage
exports.calculatePercentage = (value, percentage) => {
  return (value * percentage) / 100;
};

// Truncate text
exports.truncate = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Sleep/delay function
exports.sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Extract numbers from text
exports.extractNumbers = (text) => {
  const matches = text.match(/\d+/g);
  return matches ? matches.map(Number) : [];
};

// Parse amount from text (handles different formats)
exports.parseAmount = (text) => {
  // Remove currency symbols and commas
  const cleaned = text.replace(/[₦$,]/g, '');
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : amount;
};

// Check if text contains keywords
exports.containsKeywords = (text, keywords) => {
  const lowercased = text.toLowerCase();
  return keywords.some(keyword => lowercased.includes(keyword.toLowerCase()));
};

// Get network from phone number (Nigerian)
exports.getNetworkFromPhone = (phone) => {
  const cleaned = exports.formatPhoneNumber(phone);
  
  if (!cleaned || cleaned.length < 4) return 'unknown';
  
  const prefix = cleaned.substring(0, 4);
  
  // MTN prefixes
  if (['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906'].includes(prefix)) {
    return 'mtn';
  }
  
  // Glo prefixes
  if (['0805', '0705', '0815', '0811', '0905'].includes(prefix)) {
    return 'glo';
  }
  
  // Airtel prefixes
  if (['0802', '0808', '0708', '0812', '0701', '0902', '0907'].includes(prefix)) {
    return 'airtel';
  }
  
  // 9mobile prefixes
  if (['0809', '0817', '0818', '0909', '0908'].includes(prefix)) {
    return '9mobile';
  }
  
  return 'unknown';
};

// Mask sensitive data (for logging)
exports.maskSensitive = (text, visibleChars = 4) => {
  if (!text || text.length <= visibleChars) return text;
  const visible = text.substring(0, visibleChars);
  const masked = '*'.repeat(text.length - visibleChars);
  return visible + masked;
};

// Retry function with exponential backoff
exports.retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await exports.sleep(delay);
    }
  }
};

// Parse boolean from various inputs
exports.parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return ['true', 'yes', '1', 'on'].includes(lower);
  }
  return Boolean(value);
};







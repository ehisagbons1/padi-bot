/**
 * Simple logger utility
 */

const config = require('../config/config');

class Logger {
  constructor() {
    this.isDevelopment = config.nodeEnv === 'development';
  }

  info(message, data = null) {
    console.log(`ℹ️  [INFO] ${message}`, data || '');
  }

  success(message, data = null) {
    console.log(`✅ [SUCCESS] ${message}`, data || '');
  }

  error(message, error = null) {
    console.error(`❌ [ERROR] ${message}`, error || '');
    if (error && error.stack && this.isDevelopment) {
      console.error(error.stack);
    }
  }

  warn(message, data = null) {
    console.warn(`⚠️  [WARN] ${message}`, data || '');
  }

  debug(message, data = null) {
    if (this.isDevelopment) {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  }

  transaction(type, status, amount, user) {
    const symbol = status === 'completed' ? '✅' : status === 'failed' ? '❌' : '⏳';
    console.log(`${symbol} [TRANSACTION] ${type.toUpperCase()} - ₦${amount} - User: ${user} - Status: ${status}`);
  }

  webhook(message, data = null) {
    console.log(`📨 [WEBHOOK] ${message}`, data || '');
  }

  api(method, url, status, duration = null) {
    const statusSymbol = status >= 200 && status < 300 ? '✅' : '❌';
    const durationStr = duration ? ` (${duration}ms)` : '';
    console.log(`${statusSymbol} [API] ${method} ${url} - ${status}${durationStr}`);
  }
}

module.exports = new Logger();







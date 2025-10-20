const Settings = require('../models/Settings');
const GiftCardProduct = require('../models/GiftCardProduct');
const DataPlan = require('../models/DataPlan');
const NodeCache = require('node-cache');

// Cache settings for 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

class SettingsService {
  // Get bot settings
  async getBotSettings() {
    const cached = cache.get('settings');
    if (cached) return cached;

    const settings = await Settings.getInstance();
    // Convert to plain object to avoid Mongoose document caching issues
    const settingsObj = settings.toObject();
    cache.set('settings', settingsObj);
    return settingsObj;
  }

  // Get bot name
  async getBotName() {
    const settings = await this.getBotSettings();
    return settings.bot.name;
  }

  // Clear cache
  clearCache() {
    cache.del('settings');
  }

  // Get welcome message
  async getWelcomeMessage() {
    const settings = await this.getBotSettings();
    return settings.bot.welcomeMessage;
  }

  // Check if service is enabled
  async isServiceEnabled(serviceName) {
    const settings = await this.getBotSettings();
    return settings.services[serviceName]?.enabled ?? true;
  }

  // Check maintenance mode
  async isMaintenanceMode() {
    const settings = await this.getBotSettings();
    return settings.maintenance.enabled;
  }

  // Get maintenance message
  async getMaintenanceMessage() {
    const settings = await this.getBotSettings();
    return settings.maintenance.message;
  }

  // Get gift card products
  async getGiftCardProducts() {
    const cached = cache.get('giftcard_products');
    if (cached) return cached;

    const products = await GiftCardProduct.find({ enabled: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    cache.set('giftcard_products', products);
    return products;
  }

  // Get gift card product by code
  async getGiftCardProduct(code) {
    const products = await this.getGiftCardProducts();
    return products.find(p => p.code === code.toLowerCase());
  }

  // Get rate for gift card
  async getGiftCardRate(code, value) {
    const product = await this.getGiftCardProduct(code);
    if (!product) return null;

    // Find exact rate
    const rateObj = product.rates.find(r => r.value === value);
    if (rateObj) return rateObj.rate;

    // Use default rate
    return Math.floor(value * product.defaultRate);
  }

  // Get data plans for network
  async getDataPlans(network) {
    const cacheKey = `data_plans_${network}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const plans = await DataPlan.find({ network: network.toLowerCase(), enabled: true })
      .sort({ displayOrder: 1, price: 1 })
      .lean();

    cache.set(cacheKey, plans);
    return plans;
  }

  // Get data plan by code
  async getDataPlan(code) {
    const allPlans = await DataPlan.find({ enabled: true }).lean();
    return allPlans.find(p => p.code === code);
  }

  // Clear cache (call when settings change)
  clearCache() {
    cache.flushAll();
  }
}

module.exports = new SettingsService();


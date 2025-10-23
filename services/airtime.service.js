const axios = require('axios');
const config = require('../config/config');
const crypto = require('crypto');

class AirtimeService {
  constructor() {
    this.provider = 'vtpass'; // Default provider
  }

  async purchaseAirtime({ network, phone, amount }) {
    try {
      // Choose provider based on configuration
      if (config.services.vtpass.apiKey) {
        return await this.purchaseViaVTPass(network, phone, amount);
      } else if (config.services.shago.apiHash) {
        return await this.purchaseViaShago(network, phone, amount);
      } else {
        // Demo mode - simulate successful purchase
        return await this.simulatePurchase(network, phone, amount);
      }
    } catch (error) {
      console.error('Airtime purchase error:', error);
      throw new Error('Failed to purchase airtime. Please try again.');
    }
  }

  // VTPass Integration
  async purchaseViaVTPass(network, phone, amount) {
    try {
      const requestId = this.generateRequestId();
      
      // VTPass service IDs
      const serviceIds = {
        'mtn': 'mtn',
        'glo': 'glo',
        'airtel': 'airtel',
        '9mobile': 'etisalat'
      };

      const data = {
        request_id: requestId,
        serviceID: serviceIds[network],
        amount: amount,
        phone: phone,
      };

      const response = await axios.post(
        `${config.services.vtpass.baseUrl}/pay`,
        data,
        {
          headers: {
            'api-key': config.services.vtpass.apiKey,
            'secret-key': config.services.vtpass.secretKey,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.code === '000') {
        return {
          success: true,
          reference: response.data.requestId,
          transactionId: response.data.transactionId,
          provider: 'vtpass',
          message: 'Airtime purchase successful'
        };
      } else {
        throw new Error(response.data.response_description || 'Purchase failed');
      }
    } catch (error) {
      console.error('VTPass error:', error.response?.data || error);
      throw error;
    }
  }

  // Shago Integration
  async purchaseViaShago(network, phone, amount) {
    try {
      const networkCodes = {
        'mtn': 'MTN',
        'glo': 'GLO',
        'airtel': 'AIRTEL',
        '9mobile': '9MOBILE'
      };

      const data = {
        serviceCode: 'QAB',
        phone: phone,
        amount: amount,
        network: networkCodes[network],
        request_id: this.generateRequestId(),
      };

      const hashString = config.services.shago.apiHash + data.request_id + config.services.shago.publicKey;
      const hash = crypto.createHash('sha512').update(hashString).digest('hex');

      const response = await axios.post(
        `${config.services.shago.baseUrl}/b2b`,
        data,
        {
          headers: {
            'hashKey': hash,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.status === '200') {
        return {
          success: true,
          reference: response.data.reference,
          provider: 'shago',
          message: 'Airtime purchase successful'
        };
      } else {
        throw new Error(response.data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Shago error:', error.response?.data || error);
      throw error;
    }
  }

  // Simulate purchase (for demo/testing)
  async simulatePurchase(network, phone, amount) {
    console.log(`🔧 DEMO MODE: Simulating airtime purchase - ${network} ${amount} to ${phone}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      reference: this.generateRequestId(),
      provider: 'demo',
      message: 'Airtime purchase successful (Demo Mode)',
      demo: true
    };
  }

  generateRequestId() {
    return `AIR-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
}

module.exports = new AirtimeService();







const axios = require('axios');
const config = require('../config/config');
const crypto = require('crypto');

class DataService {
  constructor() {
    this.provider = 'vtpass';
  }

  async purchaseData({ network, phone, planCode, amount }) {
    try {
      if (config.services.vtpass.apiKey) {
        return await this.purchaseViaVTPass(network, phone, planCode, amount);
      } else if (config.services.shago.apiHash) {
        return await this.purchaseViaShago(network, phone, planCode, amount);
      } else {
        return await this.simulatePurchase(network, phone, planCode, amount);
      }
    } catch (error) {
      console.error('Data purchase error:', error);
      throw new Error('Failed to purchase data. Please try again.');
    }
  }

  async purchaseViaVTPass(network, phone, planCode, amount) {
    try {
      const requestId = this.generateRequestId();
      
      // VTPass service IDs for data
      const serviceIds = {
        'mtn': 'mtn-data',
        'glo': 'glo-data',
        'airtel': 'airtel-data',
        '9mobile': 'etisalat-data'
      };

      const data = {
        request_id: requestId,
        serviceID: serviceIds[network],
        billersCode: phone,
        variation_code: planCode,
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
          message: 'Data purchase successful'
        };
      } else {
        throw new Error(response.data.response_description || 'Purchase failed');
      }
    } catch (error) {
      console.error('VTPass data error:', error.response?.data || error);
      throw error;
    }
  }

  async purchaseViaShago(network, phone, planCode, amount) {
    try {
      const networkCodes = {
        'mtn': 'MTN',
        'glo': 'GLO',
        'airtel': 'AIRTEL',
        '9mobile': '9MOBILE'
      };

      const data = {
        serviceCode: 'DTV',
        phone: phone,
        amount: amount,
        network: networkCodes[network],
        dataplan: planCode,
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
          message: 'Data purchase successful'
        };
      } else {
        throw new Error(response.data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Shago data error:', error.response?.data || error);
      throw error;
    }
  }

  async simulatePurchase(network, phone, planCode, amount) {
    console.log(`🔧 DEMO MODE: Simulating data purchase - ${network} ${planCode} to ${phone}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      success: true,
      reference: this.generateRequestId(),
      provider: 'demo',
      message: 'Data purchase successful (Demo Mode)',
      demo: true
    };
  }

  generateRequestId() {
    return `DATA-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
}

module.exports = new DataService();






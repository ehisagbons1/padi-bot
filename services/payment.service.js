const axios = require('axios');
const config = require('../config/config');
const crypto = require('crypto');

class PaymentService {
  // Paystack Integration
  async initiatePaystackPayment({ amount, email, phoneNumber, metadata }) {
    try {
      const reference = this.generateReference('PAY');

      const data = {
        email: email,
        amount: amount * 100, // Paystack uses kobo
        reference: reference,
        callback_url: `${config.app.url}/payment/callback/paystack`,
        metadata: {
          ...metadata,
          phoneNumber: phoneNumber,
        }
      };

      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        data,
        {
          headers: {
            'Authorization': `Bearer ${config.payment.paystack.secretKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.status) {
        return {
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
          reference: reference,
        };
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error) {
      console.error('Paystack error:', error.response?.data || error);
      throw new Error('Failed to initialize payment');
    }
  }

  // Verify Paystack Payment
  async verifyPaystackPayment(reference) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${config.payment.paystack.secretKey}`,
          }
        }
      );

      if (response.data.status && response.data.data.status === 'success') {
        return {
          success: true,
          amount: response.data.data.amount / 100, // Convert from kobo
          reference: response.data.data.reference,
          paidAt: response.data.data.paid_at,
        };
      } else {
        return {
          success: false,
          message: 'Payment not successful',
        };
      }
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw error;
    }
  }

  // Flutterwave Integration
  async initiateFlutterwavePayment({ amount, email, phoneNumber, metadata }) {
    try {
      const reference = this.generateReference('FLW');

      const data = {
        tx_ref: reference,
        amount: amount,
        currency: 'NGN',
        redirect_url: `${config.app.url}/payment/callback/flutterwave`,
        customer: {
          email: email,
          phonenumber: phoneNumber,
        },
        customizations: {
          title: 'Wallet Funding',
          description: 'Fund WhatsApp Bot Wallet',
        },
        meta: metadata,
      };

      const response = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        data,
        {
          headers: {
            'Authorization': `Bearer ${config.payment.flutterwave.secretKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.status === 'success') {
        return {
          link: response.data.data.link,
          reference: reference,
        };
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (error) {
      console.error('Flutterwave error:', error.response?.data || error);
      throw new Error('Failed to initialize payment');
    }
  }

  // Verify Flutterwave Payment
  async verifyFlutterwavePayment(transactionId) {
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${config.payment.flutterwave.secretKey}`,
          }
        }
      );

      if (response.data.status === 'success' && response.data.data.status === 'successful') {
        return {
          success: true,
          amount: response.data.data.amount,
          reference: response.data.data.tx_ref,
          paidAt: response.data.data.created_at,
        };
      } else {
        return {
          success: false,
          message: 'Payment not successful',
        };
      }
    } catch (error) {
      console.error('Flutterwave verification error:', error);
      throw error;
    }
  }

  generateReference(prefix = 'TXN') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }
}

module.exports = new PaymentService();







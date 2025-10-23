const axios = require('axios');
const config = require('../config/config');

class GiftCardService {
  async submitCard({ cardType, cardValue, cardCode, images }) {
    try {
      if (config.services.giftcard.apiKey) {
        return await this.submitToProvider(cardType, cardValue, cardCode, images);
      } else {
        return await this.simulateSubmission(cardType, cardValue, cardCode, images);
      }
    } catch (error) {
      console.error('Gift card submission error:', error);
      throw new Error('Failed to submit gift card. Please try again.');
    }
  }

  async submitToProvider(cardType, cardValue, cardCode, images) {
    try {
      const data = {
        cardType: cardType,
        cardValue: cardValue,
        cardCode: cardCode,
        images: images,
        timestamp: Date.now(),
      };

      const response = await axios.post(
        `${config.services.giftcard.apiUrl}/submit`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${config.services.giftcard.apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return {
        success: true,
        reference: response.data.reference,
        status: response.data.status || 'pending',
        message: response.data.message || 'Card submitted successfully'
      };
    } catch (error) {
      console.error('Gift card provider error:', error.response?.data || error);
      throw error;
    }
  }

  async simulateSubmission(cardType, cardValue, cardCode, images) {
    console.log(`🔧 DEMO MODE: Simulating gift card submission - ${cardType} $${cardValue}`);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate 80% auto-approval
    const autoApprove = Math.random() > 0.2;

    return {
      success: true,
      reference: this.generateReference(),
      status: autoApprove ? 'completed' : 'pending',
      message: autoApprove ? 'Card approved automatically (Demo)' : 'Card under review (Demo)',
      demo: true
    };
  }

  generateReference() {
    return `GC-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  // Get current rates
  async getRates(cardType) {
    // In production, fetch from API
    // For now, return static rates
    const rates = {
      'itunes': { 100: 350, 200: 700, 500: 1750 },
      'amazon': { 100: 370, 200: 740, 500: 1850 },
      'googleplay': { 100: 340, 200: 680, 500: 1700 },
      'steam': { 100: 360, 200: 720, 500: 1800 },
      'other': { 100: 330, 200: 660, 500: 1650 },
    };

    return rates[cardType] || rates['other'];
  }
}

module.exports = new GiftCardService();







const config = require('../config/config');
const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.provider = config.whatsapp.provider;
    
    // Initialize Twilio if needed
    if (this.provider === 'twilio') {
      const twilio = require('twilio');
      this.twilioClient = twilio(
        config.whatsapp.twilio.accountSid,
        config.whatsapp.twilio.authToken
      );
    }
  }

  // Send message (supports both Twilio and Meta)
  async sendMessage(to, message) {
    try {
      if (this.provider === 'twilio') {
        return await this.sendViaTwilio(to, message);
      } else if (this.provider === 'meta') {
        return await this.sendViaMeta(to, message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Send via Twilio
  async sendViaTwilio(to, message) {
    try {
      // Ensure number has whatsapp: prefix
      const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      const result = await this.twilioClient.messages.create({
        from: config.whatsapp.twilio.whatsappNumber,
        to: toNumber,
        body: message,
      });

      console.log(`✅ Message sent via Twilio: ${result.sid}`);
      return result;
    } catch (error) {
      console.error('Twilio send error:', error);
      throw error;
    }
  }

  // Send via Meta WhatsApp Cloud API
  async sendViaMeta(to, message) {
    try {
      const url = `https://graph.facebook.com/${config.whatsapp.meta.apiVersion}/${config.whatsapp.meta.phoneNumberId}/messages`;
      
      const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message,
        }
      };

      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp.meta.accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log(`✅ Message sent via Meta: ${response.data.messages[0].id}`);
      return response.data;
    } catch (error) {
      console.error('Meta send error:', error.response?.data || error);
      throw error;
    }
  }

  // Send message with buttons (Meta only)
  async sendButtons(to, bodyText, buttons) {
    if (this.provider !== 'meta') {
      // Fallback to regular message with numbered options for Twilio
      const buttonText = buttons.map((btn, idx) => `${idx + 1}. ${btn.text}`).join('\n');
      return await this.sendMessage(to, `${bodyText}\n\n${buttonText}`);
    }

    try {
      const url = `https://graph.facebook.com/${config.whatsapp.meta.apiVersion}/${config.whatsapp.meta.phoneNumberId}/messages`;
      
      const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: bodyText
          },
          action: {
            buttons: buttons.map((btn, idx) => ({
              type: 'reply',
              reply: {
                id: btn.id || `btn_${idx}`,
                title: btn.text
              }
            }))
          }
        }
      };

      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp.meta.accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log(`✅ Button message sent`);
      return response.data;
    } catch (error) {
      console.error('Error sending buttons:', error.response?.data || error);
      throw error;
    }
  }

  // Send list message (Meta only)
  async sendList(to, bodyText, buttonText, sections) {
    if (this.provider !== 'meta') {
      // Fallback for Twilio
      let message = `${bodyText}\n\n`;
      sections.forEach(section => {
        message += `*${section.title}*\n`;
        section.rows.forEach((row, idx) => {
          message += `${idx + 1}. ${row.title}\n`;
        });
        message += '\n';
      });
      return await this.sendMessage(to, message);
    }

    try {
      const url = `https://graph.facebook.com/${config.whatsapp.meta.apiVersion}/${config.whatsapp.meta.phoneNumberId}/messages`;
      
      const data = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: bodyText
          },
          action: {
            button: buttonText,
            sections: sections
          }
        }
      };

      const response = await axios.post(url, data, {
        headers: {
          'Authorization': `Bearer ${config.whatsapp.meta.accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      console.log(`✅ List message sent`);
      return response.data;
    } catch (error) {
      console.error('Error sending list:', error.response?.data || error);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();






const config = require('../config/config');
const whatsappService = require('../services/whatsapp.service');
const messageHandler = require('../handlers/message.handler');

class WhatsAppController {
  // Verify webhook (for Meta WhatsApp Cloud API)
  async verifyWebhook(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === config.whatsapp.meta.verifyToken) {
        console.log('✅ Webhook verified');
        res.status(200).send(challenge);
      } else {
        console.log('❌ Webhook verification failed');
        res.status(403).send('Forbidden');
      }
    } catch (error) {
      console.error('Webhook verification error:', error);
      res.status(500).send('Error');
    }
  }

  // Handle incoming messages
  async handleIncomingMessage(req, res) {
    try {
      // Quick response to WhatsApp
      res.status(200).send('OK');

      let message, phoneNumber;

      // Parse based on provider
      if (config.whatsapp.provider === 'twilio') {
        // Twilio format
        phoneNumber = req.body.From?.replace('whatsapp:', '') || '';
        message = req.body.Body || '';
        
        console.log(`📱 Message from ${phoneNumber}: ${message}`);
        
      } else if (config.whatsapp.provider === 'meta') {
        // Meta WhatsApp Cloud API format
        const entry = req.body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const messageData = value?.messages?.[0];
        
        if (!messageData) {
          console.log('No message data found');
          return;
        }

        phoneNumber = messageData.from;
        message = messageData.text?.body || '';
        
        console.log(`📱 Message from ${phoneNumber}: ${message}`);
      }

      if (!phoneNumber || !message) {
        console.log('Invalid message format');
        return;
      }

      // Check if this is a sandbox error message first
      const sandboxErrorPatterns = [
        'not connected to a sandbox',
        'sandbox',
        'your number whatsapp is not connected',
        'not connected',
        'sandbox you need to connect'
      ];
      
      const isSandboxError = sandboxErrorPatterns.some(pattern => 
        message.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (isSandboxError) {
        console.log('🔍 Sandbox error detected:', message);
        const SandboxHandler = require('../handlers/sandbox.handler');
        const sandboxHandler = new SandboxHandler();
        await sandboxHandler.handleSandboxError(phoneNumber, message);
        return;
      }

      // Process message
      try {
        await messageHandler.handleMessage(phoneNumber, message);
      } catch (error) {
        // Check if this might be a sandbox error that wasn't caught
        if (error.message && error.message.includes('sandbox')) {
          console.log('🔍 Sandbox error caught in message handler:', error.message);
          const SandboxHandler = require('../handlers/sandbox.handler');
          const sandboxHandler = new SandboxHandler();
          await sandboxHandler.handleSandboxError(phoneNumber, error.message);
          return;
        }
        throw error; // Re-throw if not a sandbox error
      }

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  // Handle status updates (delivery, read receipts, etc.)
  async handleStatus(req, res) {
    try {
      res.status(200).send('OK');
      console.log('Status update:', JSON.stringify(req.body, null, 2));
    } catch (error) {
      console.error('Error handling status:', error);
      res.status(500).send('Error');
    }
  }
}

module.exports = new WhatsAppController();


const whatsappService = require('../services/whatsapp.service');
const config = require('../config/config');

class SandboxHandler {
  constructor() {
    this.whatsappService = whatsappService;
    this.sandboxCode = config.whatsapp.twilio.sandboxCode;
  }

  // Handle sandbox joining process
  async handleSandboxJoin(phoneNumber, message) {
    try {
      const messageText = message.toLowerCase().trim();
      
      // Check if user is trying to join sandbox
      if (messageText.includes('join') || messageText.includes('sandbox')) {
        await this.sendSandboxInstructions(phoneNumber);
        return true;
      }

      // Check if user sent the sandbox join command
      if (messageText.includes(this.sandboxCode.toLowerCase())) {
        await this.confirmSandboxJoin(phoneNumber);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Sandbox handler error:', error);
      return false;
    }
  }

  // Send sandbox joining instructions
  async sendSandboxInstructions(phoneNumber) {
    const instructions = `🔗 *Join Our WhatsApp Service*

To use our bot, you need to join our WhatsApp sandbox first.

📱 *How to Join:*

1️⃣ *Send this exact message* to our WhatsApp number:
\`${this.sandboxCode}\`

2️⃣ *Wait for confirmation* from WhatsApp

3️⃣ *Then send any message* to start using our services

📞 *Our WhatsApp Number:* +14155238886

💡 *After joining, you can:*
• Buy airtime and data
• Sell gift cards  
• Manage your wallet
• View transaction history

*Need help?* Reply with "HELP" after joining.`;

    await this.whatsappService.sendMessage(phoneNumber, instructions);
  }

  // Confirm sandbox joining and start registration
  async confirmSandboxJoin(phoneNumber) {
    const confirmation = `🎉 *Welcome! Sandbox Joined Successfully!*

You're now connected to our WhatsApp service!

🚀 *Let's get you registered:*

Please provide your phone number in this format:
*+2348012345678*

Or reply with *REGISTER* to start the registration process.

📱 *What you can do after registration:*
• Buy airtime and data bundles
• Sell gift cards for instant payment
• Manage your wallet
• View transaction history

*Ready to get started?* Just send your phone number!`;

    await this.whatsappService.sendMessage(phoneNumber, confirmation);
  }

  // Handle sandbox error messages
  async handleSandboxError(phoneNumber, errorMessage) {
    if (errorMessage.includes('not connected to a sandbox') || 
        errorMessage.includes('sandbox')) {
      
      const errorResponse = `❌ *Sandbox Connection Required*

It looks like you haven't joined our WhatsApp sandbox yet.

📱 *To join, send this message* to +14155238886:
\`${this.sandboxCode}\`

🔄 *Steps:*
1. Copy the message above
2. Send it to +14155238886
3. Wait for "You are all set!" confirmation
4. Come back and send any message to start

💡 *After joining, you can register and use all our services!*

*Need help?* Contact support.`;

      await this.whatsappService.sendMessage(phoneNumber, errorResponse);
      return true;
    }
    
    return false;
  }

  // Send welcome message for new users
  async sendWelcomeMessage(phoneNumber) {
    const welcome = `👋 *Welcome to WhatsApp Commerce Bot!*

I see you've joined our sandbox successfully!

🚀 *Let's get you started:*

To use our services, I need to register you first.

📱 *Please provide your phone number* in this format:
*+2348012345678*

Or reply with *REGISTER* to begin.

*What we offer:*
• 💰 Buy airtime & data
• 🎁 Sell gift cards
• 💳 Wallet management
• 📊 Transaction history

*Ready to register?* Just send your phone number!`;

    await this.whatsappService.sendMessage(phoneNumber, welcome);
  }
}

module.exports = SandboxHandler;

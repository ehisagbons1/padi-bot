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
    console.log('🔍 Processing sandbox error for:', phoneNumber, 'Message:', errorMessage);
    
    const sandboxErrorPatterns = [
      'not connected to a sandbox',
      'sandbox',
      'your number whatsapp is not connected',
      'not connected',
      'sandbox you need to connect',
      'your number whatsapp is not connected to sandbox',
      'not connected to sandbox',
      'sandbox you need to connect it first',
      'whatsapp is not connected',
      'number whatsapp is not connected'
    ];
    
    const isSandboxError = sandboxErrorPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isSandboxError) {
      console.log('✅ Sandbox error confirmed, sending instructions to:', phoneNumber);
      
      // Get the actual sandbox code from Twilio console
      const sandboxCode = this.sandboxCode || 'join your-sandbox-code';
      
      const errorResponse = `❌ *Twilio Sandbox Connection Required*

Your WhatsApp number is not connected to our sandbox yet.

🔗 *To connect your number:*

1️⃣ *Go to your Twilio Console:*
   https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox

2️⃣ *Find your sandbox code* (looks like: join <code>)

3️⃣ *Send that exact message* to +14155238886

4️⃣ *Wait for confirmation* from WhatsApp

5️⃣ *Then come back and send any message* to start using our bot

📱 *Example:* If your sandbox code is "join abc-123", send:
\`join abc-123\`

💡 *After connecting, you can:*
• Register and use our services
• Buy airtime and data
• Sell gift cards
• Manage your wallet

*Need help?* Check your Twilio console for the exact sandbox code.`;

      try {
        await this.whatsappService.sendMessage(phoneNumber, errorResponse);
        console.log('✅ Sandbox instructions sent to:', phoneNumber);
        return true;
      } catch (error) {
        console.error('❌ Failed to send sandbox instructions:', error);
        return false;
      }
    }
    
    console.log('❌ Not a sandbox error, ignoring');
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

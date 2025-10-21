const User = require('../models/User');
const whatsappService = require('../services/whatsapp.service');
const Session = require('../models/Session');

class RegistrationHandler {
  constructor() {
    this.whatsappService = whatsappService;
  }

  // Handle registration flow
  async handleRegistration(userId, message, session) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const messageText = message.toLowerCase().trim();
      
      switch (user.registrationStep) {
        case 'phone':
          return await this.handlePhoneStep(user, messageText, session);
        case 'name':
          return await this.handleNameStep(user, messageText, session);
        case 'complete':
          return await this.completeRegistration(user, session);
        default:
          return await this.startRegistration(user, session);
      }
    } catch (error) {
      console.error('Registration error:', error);
      await this.whatsappService.sendMessage(userId, '❌ Registration failed. Please try again.');
    }
  }

  // Start registration process
  async startRegistration(user, session) {
    await this.whatsappService.sendMessage(user._id, 
      `🎉 Welcome to ${session.settings?.bot?.name || 'WhatsApp Commerce Bot'}!
      
📱 *Registration Required*
To use our services, we need to verify your phone number.

Please reply with your phone number in this format:
*+2348012345678*

Or simply reply with: *REGISTER*`
    );

    // Update session to registration flow
    session.flow = 'registration';
    session.state = 'phone_input';
    await session.save();

    return true;
  }

  // Handle phone number input
  async handlePhoneStep(user, messageText, session) {
    // Extract phone number from message
    let phoneNumber = this.extractPhoneNumber(messageText);
    
    if (!phoneNumber) {
      await this.whatsappService.sendMessage(user._id,
        `📱 *Invalid Phone Number*
        
Please provide a valid Nigerian phone number in one of these formats:
• +2348012345678
• 08012345678
• 2348012345678

Or reply *CANCEL* to exit registration.`
      );
      return true;
    }

    // Check if phone number already exists
    const existingUser = await User.findOne({ 
      phoneNumber: phoneNumber,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      await this.whatsappService.sendMessage(user._id,
        `❌ *Phone Number Already Registered*
        
This phone number is already registered with another account.
Please use a different phone number or contact support.

Reply *CANCEL* to exit registration.`
      );
      return true;
    }

    // Update user with phone number
    user.phoneNumber = phoneNumber;
    user.registrationStep = 'name';
    await user.save();

    await this.whatsappService.sendMessage(user._id,
      `✅ *Phone Number Verified: ${phoneNumber}*
      
Now, please provide your full name:
*Example: John Doe*

Reply *CANCEL* to exit registration.`
    );

    session.state = 'name_input';
    await session.save();

    return true;
  }

  // Handle name input
  async handleNameStep(user, messageText, session) {
    if (messageText === 'cancel') {
      return await this.cancelRegistration(user, session);
    }

    // Validate name (at least 2 characters, no numbers)
    if (messageText.length < 2 || /\d/.test(messageText)) {
      await this.whatsappService.sendMessage(user._id,
        `❌ *Invalid Name*
        
Please provide a valid name (at least 2 characters, no numbers):
*Example: John Doe*

Reply *CANCEL* to exit registration.`
      );
      return true;
    }

    // Update user with name
    user.name = messageText.trim();
    user.registrationStep = 'complete';
    await user.save();

    return await this.completeRegistration(user, session);
  }

  // Complete registration
  async completeRegistration(user, session) {
    // Update user status
    user.registrationStatus = 'completed';
    user.registrationStep = 'complete';
    await user.save();

    // Clear registration flow from session
    session.flow = null;
    session.state = 'main_menu';
    await session.save();

    // Send welcome message
    const welcomeMessage = `🎉 *Registration Complete!*

Welcome to ${session.settings?.bot?.name || 'WhatsApp Commerce Bot'}, ${user.name}!

📱 *Your Details:*
• Name: ${user.name}
• Phone: ${user.phoneNumber}
• Wallet Balance: ₦${user.wallet.balance.toLocaleString()}

💰 *What you can do:*
• Buy airtime and data
• Sell gift cards
• Manage your wallet
• View transaction history

Type *MENU* to see all options or choose from the menu below:`;

    await this.whatsappService.sendMessage(user._id, welcomeMessage);

    // Send main menu
    const MenuHandler = require('./menu.handler');
    const menuHandler = new MenuHandler();
    await menuHandler.sendMainMenu(user._id, session);

    return true;
  }

  // Cancel registration
  async cancelRegistration(user, session) {
    // Reset user registration
    user.registrationStep = 'phone';
    await user.save();

    // Clear session
    session.flow = null;
    session.state = 'main_menu';
    await session.save();

    await this.whatsappService.sendMessage(user._id,
      `❌ *Registration Cancelled*
      
You can register later by sending *REGISTER* or *START*.

For now, you can still browse our services.
Type *MENU* to see available options.`
    );

    return true;
  }

  // Extract phone number from message
  extractPhoneNumber(message) {
    // Remove all non-digit characters except +
    let cleaned = message.replace(/[^\d+]/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('+234')) {
      return cleaned;
    } else if (cleaned.startsWith('234')) {
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
      return '+234' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return '+234' + cleaned.substring(1);
    }
    
    return null;
  }

  // Check if user needs registration
  async checkRegistrationStatus(user) {
    if (!user.registrationStatus || user.registrationStatus === 'pending') {
      return true; // Needs registration
    }
    return false; // Registration complete
  }
}

module.exports = RegistrationHandler;

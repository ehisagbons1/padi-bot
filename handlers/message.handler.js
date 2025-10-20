const User = require('../models/User');
const Session = require('../models/Session');
const whatsappService = require('../services/whatsapp.service');
const menuHandler = require('./menu.handler');
const airtimeHandler = require('./airtime.handler');
const dataHandler = require('./data.handler');
const giftcardHandler = require('./giftcard.handler');
const walletHandler = require('./wallet.handler');

class MessageHandler {
  async handleMessage(phoneNumber, message) {
    try {
      // Get or create user
      let user = await User.findOne({ phoneNumber });
      if (!user) {
        user = await User.create({
          phoneNumber,
          whatsappNumber: phoneNumber,
        });
        console.log(`👤 New user created: ${phoneNumber}`);
      } else {
        await user.updateLastActive();
      }

      // Get or create session
      let session = await Session.findOne({ phoneNumber });
      if (!session) {
        session = await Session.create({
          phoneNumber,
          currentState: 'main_menu',
        });
      }

      // Normalize message
      const normalizedMessage = message.trim().toLowerCase();

      // Check for cancel/back commands
      if (['cancel', 'exit', 'stop', 'back', 'menu'].includes(normalizedMessage)) {
        await session.reset();
        return await menuHandler.sendMainMenu(phoneNumber, user);
      }

      // Route to appropriate handler based on current state
      const state = session.currentState;
      const flow = session.currentFlow;

      console.log(`📊 State: ${state}, Flow: ${flow}`);

      // Main menu
      if (state === 'main_menu') {
        return await menuHandler.handleMainMenu(phoneNumber, message, user, session);
      }

      // Airtime flow
      if (flow === 'airtime') {
        return await airtimeHandler.handleAirtimeFlow(phoneNumber, message, user, session);
      }

      // Data flow
      if (flow === 'data') {
        return await dataHandler.handleDataFlow(phoneNumber, message, user, session);
      }

      // Gift card flow
      if (flow === 'giftcard_sale') {
        return await giftcardHandler.handleGiftCardFlow(phoneNumber, message, user, session);
      }

      // Wallet flow
      if (flow === 'wallet') {
        return await walletHandler.handleWalletFlow(phoneNumber, message, user, session);
      }

      // Default: show main menu
      await session.reset();
      return await menuHandler.sendMainMenu(phoneNumber, user);

    } catch (error) {
      console.error('Error handling message:', error);
      await whatsappService.sendMessage(
        phoneNumber,
        '❌ Sorry, something went wrong. Please try again by typing *menu*.'
      );
    }
  }
}

module.exports = new MessageHandler();






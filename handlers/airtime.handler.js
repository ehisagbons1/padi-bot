const whatsappService = require('../services/whatsapp.service');
const airtimeService = require('../services/airtime.service');
const Transaction = require('../models/Transaction');

const NETWORKS = {
  '1': { name: 'MTN', code: 'mtn' },
  '2': { name: 'Glo', code: 'glo' },
  '3': { name: 'Airtel', code: 'airtel' },
  '4': { name: '9mobile', code: '9mobile' },
};

class AirtimeHandler {
  async handleAirtimeFlow(phoneNumber, message, user, session) {
    const state = session.currentState;

    switch (state) {
      case 'airtime_network':
        return await this.handleNetworkSelection(phoneNumber, message, user, session);
      
      case 'airtime_phone':
        return await this.handlePhoneInput(phoneNumber, message, user, session);
      
      case 'airtime_amount':
        return await this.handleAmountInput(phoneNumber, message, user, session);
      
      case 'airtime_confirm':
        return await this.handleConfirmation(phoneNumber, message, user, session);
      
      default:
        await session.reset();
        return await whatsappService.sendMessage(phoneNumber, 'Please type *menu* to start.');
    }
  }

  async handleNetworkSelection(phoneNumber, message, user, session) {
    const choice = message.trim();

    if (choice === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    if (!NETWORKS[choice]) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ Invalid network. Please select 1-4.'
      );
    }

    const network = NETWORKS[choice];
    await session.updateState('airtime_phone', { network: network.code, networkName: network.name });

    return await whatsappService.sendMessage(
      phoneNumber,
      `📱 *${network.name} Airtime*\n\nEnter phone number:\n(e.g., 08012345678)\n\nOr type *0* to cancel.`
    );
  }

  async handlePhoneInput(phoneNumber, message, user, session) {
    const phone = message.trim().replace(/\s+/g, '');

    if (phone === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    // Validate phone number (Nigerian format)
    if (!/^(0|\+?234)?[789]\d{9}$/.test(phone)) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ Invalid phone number. Please enter a valid Nigerian number.\n(e.g., 08012345678)'
      );
    }

    // Normalize phone number
    let normalizedPhone = phone;
    if (normalizedPhone.startsWith('234')) {
      normalizedPhone = '0' + normalizedPhone.substring(3);
    } else if (normalizedPhone.startsWith('+234')) {
      normalizedPhone = '0' + normalizedPhone.substring(4);
    }

    await session.updateState('airtime_amount', { ...session.data, recipientPhone: normalizedPhone });

    return await whatsappService.sendMessage(
      phoneNumber,
      `💰 *Enter Amount*\n\nMinimum: ₦50\nMaximum: ₦10,000\n\nExample: 1000\n\nOr type *0* to cancel.`
    );
  }

  async handleAmountInput(phoneNumber, message, user, session) {
    const amount = parseInt(message.trim());

    if (message.trim() === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    if (isNaN(amount) || amount < 50 || amount > 10000) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ Invalid amount. Please enter between ₦50 and ₦10,000.'
      );
    }

    // Check wallet balance
    if (user.wallet.balance < amount) {
      return await whatsappService.sendMessage(
        phoneNumber,
        `❌ Insufficient balance!\n\nYour balance: ₦${user.wallet.balance.toLocaleString()}\nRequired: ₦${amount.toLocaleString()}\n\nPlease fund your wallet first.\nType *menu* to go back.`
      );
    }

    await session.updateState('airtime_confirm', { ...session.data, amount });

    const { networkName, recipientPhone } = session.data;
    const message_text = `
✅ *Confirm Purchase*

📱 Network: ${networkName}
📞 Phone: ${recipientPhone}
💰 Amount: ₦${amount.toLocaleString()}
💳 Payment: Wallet (₦${user.wallet.balance.toLocaleString()})

Reply:
1️⃣ Confirm & Buy
2️⃣ Cancel

`.trim();

    return await whatsappService.sendMessage(phoneNumber, message_text);
  }

  async handleConfirmation(phoneNumber, message, user, session) {
    const choice = message.trim();

    if (choice === '2' || choice.toLowerCase() === 'cancel') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    if (choice !== '1' && choice.toLowerCase() !== 'confirm') {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ Please reply with 1 to confirm or 2 to cancel.'
      );
    }

    // Process airtime purchase
    await whatsappService.sendMessage(phoneNumber, '⏳ Processing your airtime purchase...');

    try {
      const { network, recipientPhone, amount } = session.data;

      // Create transaction record
      const transaction = await Transaction.create({
        user: user._id,
        phoneNumber: user.phoneNumber,
        type: 'airtime',
        status: 'processing',
        amount: amount,
        details: {
          network: network,
          recipientNumber: recipientPhone,
        },
        payment: {
          method: 'wallet',
        }
      });

      // Deduct from wallet
      await user.deductFromWallet(amount);

      // Call airtime service
      const result = await airtimeService.purchaseAirtime({
        network: network,
        phone: recipientPhone,
        amount: amount,
      });

      // Update transaction
      transaction.status = 'completed';
      transaction.details.providerReference = result.reference;
      transaction.details.providerResponse = result;
      await transaction.save();

      // Update user statistics
      user.statistics.totalTransactions += 1;
      user.statistics.totalSpent += amount;
      await user.save();

      await whatsappService.sendMessage(
        phoneNumber,
        `✅ *Airtime Purchase Successful!*\n\n📱 ${amount} ${network.toUpperCase()} airtime sent to ${recipientPhone}\n💰 New Balance: ₦${user.wallet.balance.toLocaleString()}\n\nType *menu* for more options.`
      );

    } catch (error) {
      console.error('Airtime purchase error:', error);
      
      // Refund wallet if deducted
      if (user.wallet.balance < session.data.amount) {
        await user.addToWallet(session.data.amount);
      }

      await whatsappService.sendMessage(
        phoneNumber,
        `❌ Purchase failed: ${error.message}\n\nYour wallet has been refunded.\nType *menu* to try again.`
      );
    }

    await session.reset();
  }
}

module.exports = new AirtimeHandler();







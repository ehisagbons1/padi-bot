const whatsappService = require('../services/whatsapp.service');
const dataService = require('../services/data.service');
const Transaction = require('../models/Transaction');

const NETWORKS = {
  '1': { name: 'MTN', code: 'mtn' },
  '2': { name: 'Glo', code: 'glo' },
  '3': { name: 'Airtel', code: 'airtel' },
  '4': { name: '9mobile', code: '9mobile' },
};

const DATA_PLANS = {
  'mtn': [
    { id: '1', name: '500MB - 1 day', code: 'mtn-500mb-1day', price: 150 },
    { id: '2', name: '1GB - 1 day', code: 'mtn-1gb-1day', price: 300 },
    { id: '3', name: '2GB - 7 days', code: 'mtn-2gb-7days', price: 500 },
    { id: '4', name: '3GB - 30 days', code: 'mtn-3gb-30days', price: 1200 },
    { id: '5', name: '5GB - 30 days', code: 'mtn-5gb-30days', price: 1500 },
    { id: '6', name: '10GB - 30 days', code: 'mtn-10gb-30days', price: 2500 },
  ],
  'glo': [
    { id: '1', name: '1GB - 5 days', code: 'glo-1gb-5days', price: 350 },
    { id: '2', name: '2GB - 7 days', code: 'glo-2gb-7days', price: 500 },
    { id: '3', name: '3.5GB - 14 days', code: 'glo-3.5gb-14days', price: 1000 },
    { id: '4', name: '5.8GB - 30 days', code: 'glo-5.8gb-30days', price: 1500 },
    { id: '5', name: '10GB - 30 days', code: 'glo-10gb-30days', price: 2500 },
  ],
  'airtel': [
    { id: '1', name: '750MB - 14 days', code: 'airtel-750mb-14days', price: 500 },
    { id: '2', name: '1.5GB - 30 days', code: 'airtel-1.5gb-30days', price: 1000 },
    { id: '3', name: '3GB - 30 days', code: 'airtel-3gb-30days', price: 1500 },
    { id: '4', name: '6GB - 30 days', code: 'airtel-6gb-30days', price: 2000 },
    { id: '5', name: '10GB - 30 days', code: 'airtel-10gb-30days', price: 2500 },
  ],
  '9mobile': [
    { id: '1', name: '1GB - 1 day', code: '9mobile-1gb-1day', price: 300 },
    { id: '2', name: '1.5GB - 7 days', code: '9mobile-1.5gb-7days', price: 1000 },
    { id: '3', name: '4.5GB - 30 days', code: '9mobile-4.5gb-30days', price: 2000 },
    { id: '4', name: '11GB - 30 days', code: '9mobile-11gb-30days', price: 4000 },
  ],
};

class DataHandler {
  async handleDataFlow(phoneNumber, message, user, session) {
    const state = session.currentState;

    switch (state) {
      case 'data_network':
        return await this.handleNetworkSelection(phoneNumber, message, user, session);
      
      case 'data_plan':
        return await this.handlePlanSelection(phoneNumber, message, user, session);
      
      case 'data_phone':
        return await this.handlePhoneInput(phoneNumber, message, user, session);
      
      case 'data_confirm':
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
    await session.updateState('data_plan', { network: network.code, networkName: network.name });

    // Show data plans
    const plans = DATA_PLANS[network.code];
    let planMessage = `📶 *${network.name} Data Plans*\n\n`;
    
    plans.forEach(plan => {
      planMessage += `${plan.id}. ${plan.name} - ₦${plan.price.toLocaleString()}\n`;
    });
    
    planMessage += '\n0️⃣ Cancel\n\nSelect a plan (1-' + plans.length + '):';

    return await whatsappService.sendMessage(phoneNumber, planMessage);
  }

  async handlePlanSelection(phoneNumber, message, user, session) {
    const choice = message.trim();

    if (choice === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    const { network } = session.data;
    const plans = DATA_PLANS[network];
    const selectedPlan = plans.find(p => p.id === choice);

    if (!selectedPlan) {
      return await whatsappService.sendMessage(
        phoneNumber,
        `❌ Invalid selection. Please choose 1-${plans.length}.`
      );
    }

    await session.updateState('data_phone', { 
      ...session.data, 
      plan: selectedPlan 
    });

    return await whatsappService.sendMessage(
      phoneNumber,
      `📱 *Enter Phone Number*\n\nPlan: ${selectedPlan.name}\nPrice: ₦${selectedPlan.price.toLocaleString()}\n\nEnter phone number:\n(e.g., 08012345678)\n\nOr type *0* to cancel.`
    );
  }

  async handlePhoneInput(phoneNumber, message, user, session) {
    const phone = message.trim().replace(/\s+/g, '');

    if (phone === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    // Validate phone number
    if (!/^(0|\+?234)?[789]\d{9}$/.test(phone)) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ Invalid phone number. Please enter a valid Nigerian number.'
      );
    }

    // Normalize phone number
    let normalizedPhone = phone;
    if (normalizedPhone.startsWith('234')) {
      normalizedPhone = '0' + normalizedPhone.substring(3);
    } else if (normalizedPhone.startsWith('+234')) {
      normalizedPhone = '0' + normalizedPhone.substring(4);
    }

    const { plan } = session.data;

    // Check wallet balance
    if (user.wallet.balance < plan.price) {
      return await whatsappService.sendMessage(
        phoneNumber,
        `❌ Insufficient balance!\n\nYour balance: ₦${user.wallet.balance.toLocaleString()}\nRequired: ₦${plan.price.toLocaleString()}\n\nPlease fund your wallet first.\nType *menu* to go back.`
      );
    }

    await session.updateState('data_confirm', { ...session.data, recipientPhone: normalizedPhone });

    const { networkName } = session.data;
    const confirmMessage = `
✅ *Confirm Purchase*

📶 Network: ${networkName}
📦 Plan: ${plan.name}
📞 Phone: ${normalizedPhone}
💰 Price: ₦${plan.price.toLocaleString()}
💳 Payment: Wallet (₦${user.wallet.balance.toLocaleString()})

Reply:
1️⃣ Confirm & Buy
2️⃣ Cancel
`.trim();

    return await whatsappService.sendMessage(phoneNumber, confirmMessage);
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

    // Process data purchase
    await whatsappService.sendMessage(phoneNumber, '⏳ Processing your data purchase...');

    try {
      const { network, plan, recipientPhone } = session.data;

      // Create transaction
      const transaction = await Transaction.create({
        user: user._id,
        phoneNumber: user.phoneNumber,
        type: 'data',
        status: 'processing',
        amount: plan.price,
        details: {
          network: network,
          recipientNumber: recipientPhone,
          dataBundle: plan.name,
          planCode: plan.code,
        },
        payment: {
          method: 'wallet',
        }
      });

      // Deduct from wallet
      await user.deductFromWallet(plan.price);

      // Call data service
      const result = await dataService.purchaseData({
        network: network,
        phone: recipientPhone,
        planCode: plan.code,
        amount: plan.price,
      });

      // Update transaction
      transaction.status = 'completed';
      transaction.details.providerReference = result.reference;
      transaction.details.providerResponse = result;
      await transaction.save();

      // Update user statistics
      user.statistics.totalTransactions += 1;
      user.statistics.totalSpent += plan.price;
      await user.save();

      await whatsappService.sendMessage(
        phoneNumber,
        `✅ *Data Purchase Successful!*\n\n📶 ${plan.name} sent to ${recipientPhone}\n💰 New Balance: ₦${user.wallet.balance.toLocaleString()}\n\nType *menu* for more options.`
      );

    } catch (error) {
      console.error('Data purchase error:', error);
      
      // Refund wallet
      if (session.data.plan) {
        await user.addToWallet(session.data.plan.price);
      }

      await whatsappService.sendMessage(
        phoneNumber,
        `❌ Purchase failed: ${error.message}\n\nYour wallet has been refunded.\nType *menu* to try again.`
      );
    }

    await session.reset();
  }
}

module.exports = new DataHandler();






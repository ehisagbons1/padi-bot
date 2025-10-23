const whatsappService = require('../services/whatsapp.service');
const paymentService = require('../services/payment.service');
const Transaction = require('../models/Transaction');

class WalletHandler {
  async handleWalletFlow(phoneNumber, message, user, session) {
    const state = session.currentState;

    switch (state) {
      case 'wallet_menu':
        return await this.handleWalletMenu(phoneNumber, message, user, session);
      
      case 'wallet_fund_amount':
        return await this.handleFundAmount(phoneNumber, message, user, session);
      
      case 'wallet_fund_method':
        return await this.handlePaymentMethod(phoneNumber, message, user, session);
      
      default:
        await session.reset();
        return await whatsappService.sendMessage(phoneNumber, 'Please type *menu* to start.');
    }
  }

  async handleWalletMenu(phoneNumber, message, user, session) {
    const choice = message.trim();

    switch (choice) {
      case '1':
      case 'fund':
        await session.updateState('wallet_fund_amount', {});
        return await whatsappService.sendMessage(
          phoneNumber,
          `💰 *Fund Wallet*\n\nEnter amount to fund:\nMinimum: ₦100\nMaximum: ₦500,000\n\nExample: 5000\n\nOr type *0* to cancel.`
        );

      case '2':
      case 'withdraw':
        return await whatsappService.sendMessage(
          phoneNumber,
          `🏦 *Withdraw*\n\n🔜 Coming soon!\nYou'll be able to withdraw to your bank account.\n\nType *menu* to go back.`
        );

      case '3':
      case 'transfer':
        return await whatsappService.sendMessage(
          phoneNumber,
          `💸 *Transfer*\n\n🔜 Coming soon!\nYou'll be able to transfer to other users.\n\nType *menu* to go back.`
        );

      case '4':
      case 'history':
        await session.reset();
        const menuHandler = require('./menu.handler');
        return await menuHandler.sendTransactionHistory(phoneNumber, user);

      case '0':
        await session.reset();
        const menuHandler2 = require('./menu.handler');
        return await menuHandler2.sendMainMenu(phoneNumber, user);

      default:
        return await whatsappService.sendMessage(
          phoneNumber,
          '❌ Invalid option. Please reply 1-4.'
        );
    }
  }

  async handleFundAmount(phoneNumber, message, user, session) {
    const amount = parseInt(message.trim());

    if (message.trim() === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    if (isNaN(amount) || amount < 100 || amount > 500000) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ Invalid amount. Please enter between ₦100 and ₦500,000.'
      );
    }

    await session.updateState('wallet_fund_method', { amount });

    const methodMessage = `
💰 *Fund ₦${amount.toLocaleString()}*

Select Payment Method:
1️⃣ Paystack (Card/Bank)
2️⃣ Flutterwave (Card/Bank)
3️⃣ Bank Transfer (Manual)
0️⃣ Cancel

Reply with a number (1-3).
`.trim();

    return await whatsappService.sendMessage(phoneNumber, methodMessage);
  }

  async handlePaymentMethod(phoneNumber, message, user, session) {
    const choice = message.trim();

    if (choice === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    const { amount } = session.data;

    try {
      let paymentLink, reference;

      switch (choice) {
        case '1':
          // Paystack
          const paystackResult = await paymentService.initiatePaystackPayment({
            amount: amount,
            email: user.profile.email || `${phoneNumber}@temp.com`,
            phoneNumber: phoneNumber,
            metadata: {
              userId: user._id,
              purpose: 'wallet_funding'
            }
          });

          paymentLink = paystackResult.authorization_url;
          reference = paystackResult.reference;
          break;

        case '2':
          // Flutterwave
          const flutterwaveResult = await paymentService.initiateFlutterwavePayment({
            amount: amount,
            phoneNumber: phoneNumber,
            email: user.profile.email || `${phoneNumber}@temp.com`,
            metadata: {
              userId: user._id,
              purpose: 'wallet_funding'
            }
          });

          paymentLink = flutterwaveResult.link;
          reference = flutterwaveResult.reference;
          break;

        case '3':
          // Bank Transfer
          await session.reset();
          return await whatsappService.sendMessage(
            phoneNumber,
            `🏦 *Bank Transfer*\n\n*Bank:* GTBank\n*Account Number:* 0123456789\n*Account Name:* WhatsApp Bot Ltd\n\n💰 Amount: ₦${amount.toLocaleString()}\n\n⚠️ Use your phone number (${phoneNumber}) as reference.\n\nAfter payment, type *CONFIRM* with the transaction reference.\n\nType *menu* to cancel.`
          );

        default:
          return await whatsappService.sendMessage(
            phoneNumber,
            '❌ Invalid option. Please select 1-3.'
          );
      }

      // Create transaction
      await Transaction.create({
        user: user._id,
        phoneNumber: user.phoneNumber,
        type: 'wallet_funding',
        status: 'pending',
        amount: amount,
        payment: {
          method: choice === '1' ? 'paystack' : 'flutterwave',
          reference: reference,
          gateway: choice === '1' ? 'paystack' : 'flutterwave',
        }
      });

      await whatsappService.sendMessage(
        phoneNumber,
        `✅ *Payment Link Generated*\n\n💰 Amount: ₦${amount.toLocaleString()}\n🔗 Link: ${paymentLink}\n\n📝 Reference: ${reference}\n\n⏱️ Link expires in 30 minutes.\nYou'll receive a confirmation once payment is successful.\n\nType *menu* to go back.`
      );

    } catch (error) {
      console.error('Payment initiation error:', error);
      await whatsappService.sendMessage(
        phoneNumber,
        `❌ Payment initiation failed: ${error.message}\n\nPlease try again.\nType *menu* to go back.`
      );
    }

    await session.reset();
  }
}

module.exports = new WalletHandler();







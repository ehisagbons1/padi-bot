const whatsappService = require('../services/whatsapp.service');
const giftcardService = require('../services/giftcard.service');
const settingsService = require('../services/settings.service');
const Transaction = require('../models/Transaction');

class GiftCardHandler {
  async handleGiftCardFlow(phoneNumber, message, user, session) {
    const state = session.currentState;

    switch (state) {
      case 'giftcard_type':
        return await this.handleCardTypeSelection(phoneNumber, message, user, session);
      
      case 'giftcard_value':
        return await this.handleValueInput(phoneNumber, message, user, session);
      
      case 'giftcard_image':
        return await this.handleImageUpload(phoneNumber, message, user, session);
      
      case 'giftcard_code':
        return await this.handleCodeInput(phoneNumber, message, user, session);
      
      case 'giftcard_confirm':
        return await this.handleConfirmation(phoneNumber, message, user, session);
      
      default:
        await session.reset();
        return await whatsappService.sendMessage(phoneNumber, 'Please type *menu* to start.');
    }
  }

  async handleCardTypeSelection(phoneNumber, message, user, session) {
    const choice = message.trim();

    if (choice === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    // Get products from database
    const products = await settingsService.getGiftCardProducts();
    
    if (!products || products.length === 0) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ No gift card products available at the moment. Type *menu* to go back.'
      );
    }

    const choiceNum = parseInt(choice);
    if (isNaN(choiceNum) || choiceNum < 1 || choiceNum > products.length) {
      return await whatsappService.sendMessage(
        phoneNumber,
        `❌ Invalid card type. Please select 1-${products.length}.`
      );
    }

    const cardType = products[choiceNum - 1];
    await session.updateState('giftcard_value', { 
      cardType: cardType.code, 
      cardName: cardType.name, 
      rates: cardType.rates,
      defaultRate: cardType.defaultRate,
    });

    // Show rates
    let rateMessage = `🎁 *${cardType.name} Gift Card*\n\n💵 *Current Rates:*\n`;
    cardType.rates.forEach(r => {
      rateMessage += `$${r.value} = ₦${r.rate.toLocaleString()}\n`;
    });
    rateMessage += '\n📝 *Enter card value in USD:*\n(e.g., 100, 200, 500)\n\nOr type *0* to cancel.';

    return await whatsappService.sendMessage(phoneNumber, rateMessage);
  }

  async handleValueInput(phoneNumber, message, user, session) {
    const value = parseInt(message.trim());

    if (message.trim() === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    if (isNaN(value) || value < 10) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ Invalid value. Please enter a valid amount (minimum $10).'
      );
    }

    // Calculate payout from database rates
    const { cardType, rates, defaultRate } = session.data;
    let payout;
    
    // Find exact rate
    const rateObj = rates.find(r => r.value === value);
    if (rateObj) {
      payout = rateObj.rate;
    } else {
      // Use default rate
      payout = Math.floor(value * (defaultRate || 3.5));
    }

    await session.updateState('giftcard_image', { ...session.data, cardValue: value, payout });

    return await whatsappService.sendMessage(
      phoneNumber,
      `💰 *You will receive: ₦${payout.toLocaleString()}*\n\n📸 *Send card image(s)*\nYou can send multiple images.\n\n⚠️ *Important:*\n- Card must be clearly visible\n- No scratched/used cards\n- Both front and back if required\n\nAfter sending images, type *DONE*\n\nOr type *0* to cancel.`
    );
  }

  async handleImageUpload(phoneNumber, message, user, session) {
    const text = message.trim().toUpperCase();

    if (text === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    if (text === 'DONE') {
      // In real implementation, check if images were received
      // For now, proceed to code input
      await session.updateState('giftcard_code', { ...session.data });

      return await whatsappService.sendMessage(
        phoneNumber,
        `🔢 *Enter card code(s)*\n\nType the code(s) on the card.\nIf multiple cards, separate with commas.\n\nExample: XXXX-XXXX-XXXX, YYYY-YYYY-YYYY\n\nOr type *SKIP* if code is visible in image.`
      );
    }

    // Store image info (in real app, handle actual image uploads)
    const images = session.data.images || [];
    images.push({ message: 'Image received', timestamp: Date.now() });
    await session.updateState('giftcard_image', { ...session.data, images });

    return await whatsappService.sendMessage(
      phoneNumber,
      `✅ Image received! (${images.length})\n\nSend more images or type *DONE* to continue.`
    );
  }

  async handleCodeInput(phoneNumber, message, user, session) {
    const code = message.trim();

    if (code === '0') {
      await session.reset();
      const menuHandler = require('./menu.handler');
      return await menuHandler.sendMainMenu(phoneNumber, user);
    }

    await session.updateState('giftcard_confirm', { ...session.data, cardCode: code });

    const { cardName, cardValue, payout } = session.data;
    const confirmMessage = `
✅ *Confirm Gift Card Sale*

🎁 Card Type: ${cardName}
💵 Card Value: $${cardValue}
💰 You'll Receive: ₦${payout.toLocaleString()}
📸 Images: Received
🔢 Code: ${code === 'SKIP' ? 'In image' : 'Provided'}

⏱️ *Processing Time:* 5-15 minutes
💳 *Payment:* Directly to your wallet

Reply:
1️⃣ Confirm & Submit
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

    // Process gift card sale
    await whatsappService.sendMessage(phoneNumber, '⏳ Submitting your gift card...');

    try {
      const { cardType, cardName, cardValue, payout, cardCode, images } = session.data;

      // Create transaction
      const transaction = await Transaction.create({
        user: user._id,
        phoneNumber: user.phoneNumber,
        type: 'giftcard_sale',
        status: 'processing',
        amount: payout,
        details: {
          cardType: cardType,
          cardValue: `$${cardValue}`,
          cardCode: cardCode,
          cardImages: images || [],
        },
      });

      // In real implementation, submit to giftcard service for verification
      // For demo, we'll simulate approval
      const result = await giftcardService.submitCard({
        cardType: cardType,
        cardValue: cardValue,
        cardCode: cardCode,
        images: images || [],
      });

      // Update transaction
      transaction.status = result.status; // 'completed' or 'pending'
      transaction.details.providerReference = result.reference;
      await transaction.save();

      if (result.status === 'completed') {
        // Add to wallet
        await user.addToWallet(payout);
        
        // Update statistics
        user.statistics.totalTransactions += 1;
        user.statistics.totalEarned += payout;
        await user.save();

        await whatsappService.sendMessage(
          phoneNumber,
          `✅ *Gift Card Accepted!*\n\n💰 ₦${payout.toLocaleString()} added to your wallet\n💳 New Balance: ₦${user.wallet.balance.toLocaleString()}\n\nType *menu* for more options.`
        );
      } else {
        await whatsappService.sendMessage(
          phoneNumber,
          `🔄 *Under Review*\n\nYour gift card is being verified.\nYou'll receive payment within 15 minutes.\n\nReference: ${result.reference}\n\nType *menu* to continue.`
        );
      }

    } catch (error) {
      console.error('Gift card submission error:', error);

      await whatsappService.sendMessage(
        phoneNumber,
        `❌ Submission failed: ${error.message}\n\nPlease try again or contact support.\nType *menu* to go back.`
      );
    }

    await session.reset();
  }
}

module.exports = new GiftCardHandler();




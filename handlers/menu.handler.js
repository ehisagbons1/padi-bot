const whatsappService = require('../services/whatsapp.service');
const settingsService = require('../services/settings.service');

class MenuHandler {
  async sendMainMenu(phoneNumber, user) {
    // Get bot name from settings
    const botName = await settingsService.getBotName();
    const welcomeMsg = await settingsService.getWelcomeMessage();
    
    const menu = `
${welcomeMsg}
${user.name ? `Hello ${user.name}! ` : ''}

💰 *Wallet Balance:* ₦${user.wallet.balance.toLocaleString()}

📋 *Main Menu:*
1️⃣ Buy Airtime
2️⃣ Buy Data
3️⃣ Buy Card/Bill Payment
4️⃣ Sell Gift Card
5️⃣ Wallet
6️⃣ Transaction History
7️⃣ Profile
0️⃣ Help

Reply with a number (1-7) or type *help* for assistance.
`.trim();

    return await whatsappService.sendMessage(phoneNumber, menu);
  }

  async handleMainMenu(phoneNumber, message, user, session) {
    const choice = message.trim();

    switch (choice) {
      case '1':
      case 'airtime':
      case 'buy airtime':
        await session.updateState('airtime_network', {});
        session.currentFlow = 'airtime';
        await session.save();
        return await this.sendAirtimeMenu(phoneNumber);

      case '2':
      case 'data':
      case 'buy data':
        await session.updateState('data_network', {});
        session.currentFlow = 'data';
        await session.save();
        return await this.sendDataMenu(phoneNumber);

      case '3':
      case 'card':
      case 'bill':
        return await whatsappService.sendMessage(
          phoneNumber,
          '🔜 Card/Bill payment feature coming soon! Type *menu* to go back.'
        );

      case '4':
      case 'gift':
      case 'giftcard':
      case 'sell':
        await session.updateState('giftcard_type', {});
        session.currentFlow = 'giftcard_sale';
        await session.save();
        return await this.sendGiftCardMenu(phoneNumber);

      case '5':
      case 'wallet':
        await session.updateState('wallet_menu', {});
        session.currentFlow = 'wallet';
        await session.save();
        return await this.sendWalletMenu(phoneNumber, user);

      case '6':
      case 'history':
      case 'transactions':
        return await this.sendTransactionHistory(phoneNumber, user);

      case '7':
      case 'profile':
        return await this.sendProfile(phoneNumber, user);

      case '0':
      case 'help':
        return await this.sendHelp(phoneNumber);

      default:
        return await whatsappService.sendMessage(
          phoneNumber,
          '❌ Invalid option. Please reply with a number from the menu (1-7).'
        );
    }
  }

  async sendAirtimeMenu(phoneNumber) {
    const menu = `
📱 *Buy Airtime*

Select Network:
1️⃣ MTN
2️⃣ Glo
3️⃣ Airtel
4️⃣ 9mobile
0️⃣ Back to Main Menu

Reply with a number (1-4).
`.trim();

    return await whatsappService.sendMessage(phoneNumber, menu);
  }

  async sendDataMenu(phoneNumber) {
    const menu = `
📶 *Buy Data*

Select Network:
1️⃣ MTN
2️⃣ Glo
3️⃣ Airtel
4️⃣ 9mobile
0️⃣ Back to Main Menu

Reply with a number (1-4).
`.trim();

    return await whatsappService.sendMessage(phoneNumber, menu);
  }

  async sendGiftCardMenu(phoneNumber) {
    // Get products from database
    const products = await settingsService.getGiftCardProducts();
    
    if (!products || products.length === 0) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '❌ Gift card service is currently unavailable. Type *menu* to go back.'
      );
    }

    let menu = '🎁 *Sell Gift Card*\n\nSelect Card Type:\n';
    products.forEach((product, index) => {
      const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || `${index + 1}️⃣`;
      menu += `${emoji} ${product.name}\n`;
    });
    menu += '0️⃣ Back to Main Menu\n\n';
    menu += `Reply with a number (1-${products.length}).`;

    return await whatsappService.sendMessage(phoneNumber, menu.trim());
  }

  async sendWalletMenu(phoneNumber, user) {
    const menu = `
💰 *Wallet*

Current Balance: ₦${user.wallet.balance.toLocaleString()}

1️⃣ Fund Wallet
2️⃣ Withdraw
3️⃣ Transfer
4️⃣ Transaction History
0️⃣ Back to Main Menu

Reply with a number (1-4).
`.trim();

    return await whatsappService.sendMessage(phoneNumber, menu);
  }

  async sendTransactionHistory(phoneNumber, user) {
    const Transaction = require('../models/Transaction');
    
    const transactions = await Transaction.find({ phoneNumber })
      .sort({ createdAt: -1 })
      .limit(5);

    if (transactions.length === 0) {
      return await whatsappService.sendMessage(
        phoneNumber,
        '📋 *Transaction History*\n\nNo transactions yet.\n\nType *menu* to go back.'
      );
    }

    let message = '📋 *Recent Transactions*\n\n';
    
    transactions.forEach((tx, idx) => {
      const status = tx.status === 'completed' ? '✅' : 
                     tx.status === 'failed' ? '❌' : '⏳';
      message += `${idx + 1}. ${status} ${tx.type.toUpperCase()}\n`;
      message += `   Amount: ₦${tx.amount.toLocaleString()}\n`;
      message += `   Date: ${tx.createdAt.toLocaleDateString()}\n\n`;
    });

    message += 'Type *menu* to go back.';

    return await whatsappService.sendMessage(phoneNumber, message);
  }

  async sendProfile(phoneNumber, user) {
    const message = `
👤 *Your Profile*

📱 Phone: ${user.phoneNumber}
👤 Name: ${user.name || 'Not set'}
📧 Email: ${user.profile.email || 'Not set'}
💰 Wallet: ₦${user.wallet.balance.toLocaleString()}
📊 Total Transactions: ${user.statistics.totalTransactions}
🎯 Status: ${user.status}
📅 Member Since: ${user.createdAt.toLocaleDateString()}

Type *menu* to go back.
`.trim();

    return await whatsappService.sendMessage(phoneNumber, message);
  }

  async sendHelp(phoneNumber) {
    const message = `
❓ *Help & Support*

*How to use this bot:*
- Reply with numbers from the menu
- Type *menu* anytime to return to main menu
- Type *cancel* to stop any operation

*Available Services:*
✅ Buy Airtime (instant delivery)
✅ Buy Data Bundles
✅ Sell Gift Cards (get paid instantly)
✅ Wallet Management

*Need help?*
📞 Contact Support: 0800-000-0000
📧 Email: support@example.com
💬 WhatsApp: Type your issue

Type *menu* to go back.
`.trim();

    return await whatsappService.sendMessage(phoneNumber, message);
  }
}

module.exports = new MenuHandler();




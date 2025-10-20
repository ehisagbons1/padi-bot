// Check current settings
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/config');

async function checkSettings() {
    try {
        await mongoose.connect(config.database.mongoUri);
        
        const Settings = require('../models/Settings');
        const settings = await Settings.getInstance();
        
        console.log('\n⚙️  Current Bot Settings:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Bot Name:', settings.bot.name);
        console.log('Welcome Message:', settings.bot.welcomeMessage);
        console.log('Support Phone:', settings.bot.supportPhone);
        console.log('Support Email:', settings.bot.supportEmail);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        console.log('\n📊 Service Status:');
        console.log('Airtime:', settings.services.airtime.enabled ? '✅ Enabled' : '❌ Disabled');
        console.log('Data:', settings.services.data.enabled ? '✅ Enabled' : '❌ Disabled');
        console.log('Gift Card:', settings.services.giftCard.enabled ? '✅ Enabled' : '❌ Disabled');
        console.log('Wallet:', settings.services.wallet.enabled ? '✅ Enabled' : '❌ Disabled');
        
        console.log('\n🔧 Maintenance Mode:', settings.maintenance.enabled ? '⚠️  ACTIVE' : '✅ OFF');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkSettings();


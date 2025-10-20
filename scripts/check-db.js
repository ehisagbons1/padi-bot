// Quick script to check what's in the database
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/config');

async function checkDatabase() {
    try {
        await mongoose.connect(config.database.mongoUri);
        console.log('✅ Connected to:', config.database.mongoUri.split('@')[1].split('/')[0]);
        console.log('📊 Database:', mongoose.connection.name);
        console.log('\n📋 Collections found:');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        for (const collection of collections) {
            const count = await mongoose.connection.db.collection(collection.name).countDocuments();
            console.log(`  - ${collection.name}: ${count} documents`);
        }
        
        // Show admin details
        const Admin = require('../models/Admin');
        const admin = await Admin.findOne();
        if (admin) {
            console.log('\n👤 Admin found:');
            console.log(`  Username: ${admin.username}`);
            console.log(`  Email: ${admin.email}`);
            console.log(`  Role: ${admin.role}`);
        }
        
        // Show gift card products
        const GiftCardProduct = require('../models/GiftCardProduct');
        const products = await GiftCardProduct.find();
        console.log(`\n🎁 Gift Card Products: ${products.length}`);
        products.forEach(p => {
            console.log(`  - ${p.name} (${p.code})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkDatabase();


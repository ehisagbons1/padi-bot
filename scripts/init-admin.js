// Initialize Admin User and Default Settings
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');
const GiftCardProduct = require('../models/GiftCardProduct');
const config = require('../config/config');

async function initializeAdmin() {
    try {
        // Connect to database
        await mongoose.connect(config.database.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin exists
        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            console.log('⚠️  Admin already exists');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email);
            return;
        }

        // Create first admin
        const admin = new Admin({
            username: 'admin',
            email: 'admin@whatsapp-bot.com',
            role: 'super_admin',
            status: 'active',
            permissions: {
                manageUsers: true,
                manageTransactions: true,
                manageProducts: true,
                manageSettings: true,
                viewReports: true,
                approveGiftCards: true,
            },
        });

        // Set password
        admin.setPassword('admin123'); // CHANGE THIS IN PRODUCTION!
        await admin.save();

        console.log('\n✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 Username: admin');
        console.log('🔑 Password: admin123');
        console.log('📧 Email: admin@whatsapp-bot.com');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!');
        console.log('\n📍 Admin Dashboard: http://localhost:3000/admin');

        // Initialize settings
        const settings = await Settings.getInstance();
        console.log('\n✅ Default settings created');

        // Create sample gift card products
        const sampleProducts = [
            {
                name: 'iTunes/Apple',
                code: 'itunes',
                rates: [
                    { value: 100, rate: 35000 },
                    { value: 200, rate: 70000 },
                    { value: 500, rate: 175000 },
                ],
                defaultRate: 350,
                enabled: true,
            },
            {
                name: 'Amazon',
                code: 'amazon',
                rates: [
                    { value: 100, rate: 37000 },
                    { value: 200, rate: 74000 },
                    { value: 500, rate: 185000 },
                ],
                defaultRate: 370,
                enabled: true,
            },
            {
                name: 'Google Play',
                code: 'googleplay',
                rates: [
                    { value: 100, rate: 34000 },
                    { value: 200, rate: 68000 },
                    { value: 500, rate: 170000 },
                ],
                defaultRate: 340,
                enabled: true,
            },
            {
                name: 'Steam',
                code: 'steam',
                rates: [
                    { value: 100, rate: 36000 },
                    { value: 200, rate: 72000 },
                    { value: 500, rate: 180000 },
                ],
                defaultRate: 360,
                enabled: true,
            },
        ];

        for (const product of sampleProducts) {
            const existing = await GiftCardProduct.findOne({ code: product.code });
            if (!existing) {
                await GiftCardProduct.create({ ...product, createdBy: admin._id });
                console.log(`✅ Created ${product.name} product`);
            }
        }

        console.log('\n✅ Setup complete! You can now start the server and login to admin dashboard.');
        console.log('\nRun: npm run dev');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    }
}

initializeAdmin();


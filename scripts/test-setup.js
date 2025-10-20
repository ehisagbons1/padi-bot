/**
 * Test script to verify your setup
 * Run: node scripts/test-setup.js
 */

const config = require('../config/config');

console.log('\n🔍 Testing WhatsApp Commerce Bot Setup...\n');

let errors = 0;
let warnings = 0;

// Test 1: Node version
console.log('1️⃣  Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion >= 14) {
  console.log(`   ✅ Node.js ${nodeVersion} (OK)`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} (Need v14 or higher)`);
  errors++;
}

// Test 2: Environment variables
console.log('\n2️⃣  Checking environment variables...');

const requiredVars = {
  'PORT': config.port,
  'WHATSAPP_PROVIDER': config.whatsapp.provider,
};

const optionalVars = {
  'MONGODB_URI': config.database.mongoUri,
  'PAYSTACK_SECRET_KEY': config.payment.paystack.secretKey,
  'VTPASS_API_KEY': config.services.vtpass.apiKey,
};

Object.entries(requiredVars).forEach(([key, value]) => {
  if (value) {
    console.log(`   ✅ ${key}: Set`);
  } else {
    console.log(`   ❌ ${key}: Missing`);
    errors++;
  }
});

console.log('\n   Optional variables:');
Object.entries(optionalVars).forEach(([key, value]) => {
  if (value && !value.includes('your_') && value !== 'mongodb://localhost:27017/whatsapp-bot') {
    console.log(`   ✅ ${key}: Configured`);
  } else {
    console.log(`   ⚠️  ${key}: Not configured (will use demo mode)`);
    warnings++;
  }
});

// Test 3: WhatsApp provider config
console.log('\n3️⃣  Checking WhatsApp configuration...');
if (config.whatsapp.provider === 'twilio') {
  if (config.whatsapp.twilio.accountSid && config.whatsapp.twilio.authToken) {
    console.log(`   ✅ Twilio credentials: Configured`);
  } else {
    console.log(`   ❌ Twilio credentials: Missing`);
    errors++;
  }
} else if (config.whatsapp.provider === 'meta') {
  if (config.whatsapp.meta.accessToken && config.whatsapp.meta.phoneNumberId) {
    console.log(`   ✅ Meta credentials: Configured`);
  } else {
    console.log(`   ❌ Meta credentials: Missing`);
    errors++;
  }
} else {
  console.log(`   ❌ Invalid WhatsApp provider: ${config.whatsapp.provider}`);
  errors++;
}

// Test 4: Database connection
console.log('\n4️⃣  Testing database connection...');
const mongoose = require('mongoose');

mongoose.connect(config.database.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log(`   ✅ MongoDB: Connected`);
    
    // Test 5: Check if server can start
    console.log('\n5️⃣  Checking if server can start...');
    try {
      const express = require('express');
      const app = express();
      const server = app.listen(config.port + 1, () => {
        console.log(`   ✅ Server: Can bind to port ${config.port + 1}`);
        server.close();
        
        // Summary
        printSummary();
        
        mongoose.connection.close();
        process.exit(errors > 0 ? 1 : 0);
      });
    } catch (error) {
      console.log(`   ❌ Server: Cannot start - ${error.message}`);
      errors++;
      printSummary();
      mongoose.connection.close();
      process.exit(1);
    }
  })
  .catch((error) => {
    console.log(`   ❌ MongoDB: Connection failed - ${error.message}`);
    console.log(`   ℹ️  Make sure MongoDB is running or check your connection string`);
    errors++;
    
    // Continue with other tests
    console.log('\n5️⃣  Checking if server can start...');
    try {
      const express = require('express');
      const app = express();
      const server = app.listen(config.port + 1, () => {
        console.log(`   ✅ Server: Can bind to port ${config.port + 1}`);
        server.close();
        printSummary();
        process.exit(errors > 0 ? 1 : 0);
      });
    } catch (error) {
      console.log(`   ❌ Server: Cannot start - ${error.message}`);
      errors++;
      printSummary();
      process.exit(1);
    }
  });

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('📊 SETUP TEST SUMMARY');
  console.log('='.repeat(50));
  
  if (errors === 0 && warnings === 0) {
    console.log('✅ Perfect! Your setup is complete and ready to go!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Run: npm start');
    console.log('   2. Expose webhook with ngrok: ngrok http 3000');
    console.log('   3. Configure webhook in Twilio/Meta');
    console.log('   4. Send "Hi" to your bot!');
  } else if (errors === 0) {
    console.log(`⚠️  Setup is functional but has ${warnings} warning(s)`);
    console.log('\n⚡ You can start in DEMO MODE:');
    console.log('   - Airtime/Data purchases will be simulated');
    console.log('   - Payment links will be generated (test mode)');
    console.log('   - Configure real API keys to go live');
    console.log('\n🚀 To start: npm start');
  } else {
    console.log(`❌ Found ${errors} error(s) and ${warnings} warning(s)`);
    console.log('\n🔧 Please fix the errors above before starting.');
    console.log('\n📖 Need help? Check:');
    console.log('   - README.md for documentation');
    console.log('   - SETUP_GUIDE.md for step-by-step guide');
    console.log('   - config/env.example.txt for required variables');
  }
  
  console.log('\n');
}






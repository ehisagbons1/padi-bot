// Quick Token Verification Script
require('dotenv').config();

const testToken = 'your_token_to_test_here'; // Replace with your token
const accountSid = 'your_twilio_account_sid_here';

console.log('🔍 Testing Token: ' + testToken);
console.log('📊 Token Length: ' + testToken.length + ' characters');
console.log('');

// Try to initialize Twilio with this token
try {
  const twilio = require('twilio');
  const client = twilio(accountSid, testToken);
  
  console.log('⏳ Attempting to authenticate with Twilio...');
  console.log('');
  
  // Try to fetch account info (this will fail if token is wrong)
  client.api.accounts(accountSid)
    .fetch()
    .then(account => {
      console.log('✅ SUCCESS! Token is valid!');
      console.log('📱 Account Status:', account.status);
      console.log('📝 Account Name:', account.friendlyName);
      console.log('');
      console.log('🎉 You can use this token in your .env file!');
    })
    .catch(error => {
      console.log('❌ FAILED! This is NOT a valid Auth Token.');
      console.log('');
      console.log('Error:', error.message);
      console.log('');
      console.log('💡 Where to find the correct Auth Token:');
      console.log('   1. Go to: https://console.twilio.com/');
      console.log('   2. Find "Account Info" section');
      console.log('   3. Click the 👁️ icon next to "Auth Token"');
      console.log('   4. Copy the 32-character token');
      console.log('');
      console.log('❓ What you provided might be:');
      console.log('   - Sandbox join code (send to +14155238886 to join)');
      console.log('   - API Key (different from Auth Token)');
      console.log('   - Something else from Twilio Console');
    });
    
} catch (error) {
  console.log('❌ Error:', error.message);
}


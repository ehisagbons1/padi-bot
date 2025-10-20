// Quick Twilio WhatsApp Test Script
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('🔍 Checking Twilio Configuration...\n');
console.log('Account SID:', accountSid ? '✅ Set' : '❌ Missing');
console.log('Auth Token:', authToken ? '✅ Set' : '❌ Missing');
console.log('WhatsApp Number:', whatsappNumber ? '✅ Set' : '❌ Missing');

if (!accountSid || !authToken) {
  console.log('\n❌ Please set your Twilio credentials in .env file');
  process.exit(1);
}

console.log('\n📱 Testing Twilio Connection...');

const twilio = require('twilio');
const client = twilio(accountSid, authToken);

// Test by sending a message to yourself
const testNumber = 'whatsapp:+2348155123611'; // Replace with your number

client.messages
  .create({
    from: whatsappNumber,
    to: testNumber,
    body: '🎉 Hello from your WhatsApp Bot! Your Twilio connection is working!'
  })
  .then(message => {
    console.log('✅ Test message sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('\n📱 Check your WhatsApp for the test message!');
  })
  .catch(error => {
    console.error('❌ Error sending message:', error.message);
    if (error.code === 20003) {
      console.log('\n💡 Tip: Make sure you\'ve joined the Twilio Sandbox first!');
      console.log('   Send "join <sandbox-code>" to whatsapp:+14155238886');
    }
  });


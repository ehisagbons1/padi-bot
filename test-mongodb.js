// Quick MongoDB Atlas Connection Test
require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection...\n');

if (!mongoUri) {
  console.log('❌ MONGODB_URI not found in .env file');
  console.log('\n💡 Add this to your .env:');
  console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-bot');
  process.exit(1);
}

console.log('📊 Connection String:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@')); // Hide credentials
console.log('\n⏳ Connecting to MongoDB Atlas...\n');

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Atlas connected successfully!');
  console.log('📊 Database:', mongoose.connection.name);
  console.log('🌐 Host:', mongoose.connection.host);
  console.log('\n🎉 Your database is ready to use!');
  process.exit(0);
})
.catch((error) => {
  console.log('❌ MongoDB connection failed!\n');
  console.log('Error:', error.message);
  console.log('\n💡 Common issues:');
  console.log('   1. Check username and password are correct');
  console.log('   2. Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for testing)');
  console.log('   3. Check connection string format');
  console.log('   4. Check database user has read/write permissions');
  process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('❌ Connection timeout!');
  console.log('💡 Check your internet connection and MongoDB Atlas settings');
  process.exit(1);
}, 10000);


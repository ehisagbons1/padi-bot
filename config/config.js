require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER || 'twilio', // 'twilio' or 'meta'
    
    // Twilio
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
    },
    
    // Meta WhatsApp Cloud API
    meta: {
      accessToken: process.env.META_ACCESS_TOKEN,
      phoneNumberId: process.env.META_PHONE_NUMBER_ID,
      verifyToken: process.env.META_VERIFY_TOKEN || 'my_verify_token_123',
      appSecret: process.env.META_APP_SECRET,
      apiVersion: 'v18.0',
    }
  },
  
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp-bot',
  },
  
  payment: {
    paystack: {
      secretKey: process.env.PAYSTACK_SECRET_KEY,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    },
    flutterwave: {
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
    }
  },
  
  services: {
    vtpass: {
      apiKey: process.env.VTPASS_API_KEY,
      publicKey: process.env.VTPASS_PUBLIC_KEY,
      secretKey: process.env.VTPASS_SECRET_KEY,
      baseUrl: 'https://api-service.vtpass.com/api',
    },
    shago: {
      apiHash: process.env.SHAGO_API_HASH,
      publicKey: process.env.SHAGO_PUBLIC_KEY,
      privateKey: process.env.SHAGO_PRIVATE_KEY,
      baseUrl: 'https://shagopayments.com/api/live',
    },
    giftcard: {
      apiKey: process.env.GIFTCARD_API_KEY,
      apiUrl: process.env.GIFTCARD_API_URL,
    }
  },
  
  app: {
    url: process.env.APP_URL || 'http://localhost:3000',
    webhookPath: process.env.WEBHOOK_PATH || '/webhook/whatsapp',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 300000, // 5 minutes
  }
};



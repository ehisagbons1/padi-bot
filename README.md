# WhatsApp Commerce Bot 🤖

A powerful WhatsApp bot that enables users to buy airtime, data bundles, cards, and sell gift cards directly through WhatsApp messages.

## 🌟 Features

- ✅ **Buy Airtime** - Instant airtime purchase for MTN, Glo, Airtel, 9mobile
- 📶 **Buy Data Bundles** - Purchase data plans for all networks
- 💳 **Card/Bill Payment** - Pay for cards and bills (Coming Soon)
- 🎁 **Sell Gift Cards** - Get instant payment for iTunes, Amazon, Google Play, Steam cards
- 💰 **Wallet System** - Fund wallet, track balance, transaction history
- 📱 **Multi-Platform** - Supports both Twilio and Meta WhatsApp Cloud API
- 🔐 **Secure** - Encrypted transactions and secure payment processing

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- WhatsApp Business Account (Twilio or Meta)
- Payment Gateway Account (Paystack or Flutterwave)
- Service Provider API keys (VTPass, Shago, etc.)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd whatsapp-commerce-bot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp config/env.example.txt .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=3000
NODE_ENV=development

# WhatsApp Provider (choose: twilio or meta)
WHATSAPP_PROVIDER=twilio

# Twilio Configuration (if using Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Meta WhatsApp Cloud API (if using Meta)
META_ACCESS_TOKEN=your_meta_access_token
META_PHONE_NUMBER_ID=your_phone_number_id
META_VERIFY_TOKEN=your_custom_verify_token

# Database
MONGODB_URI=mongodb://localhost:27017/whatsapp-bot

# Payment Gateway
PAYSTACK_SECRET_KEY=sk_test_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx

# Service Providers
VTPASS_API_KEY=your_vtpass_api_key
VTPASS_SECRET_KEY=your_vtpass_secret_key

# App URL
APP_URL=https://your-domain.com
```

### 4. Start MongoDB

Make sure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

### 5. Run the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📱 WhatsApp Setup

### Option A: Twilio (Easiest for Testing)

1. **Create Twilio Account**: [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. **Get WhatsApp Sandbox**: Console → Messaging → Try it out → Send a WhatsApp message
3. **Configure Webhook**:
   - Go to Console → Messaging → Settings → WhatsApp Sandbox Settings
   - Set webhook URL: `https://your-domain.com/webhook/whatsapp`
   - Method: POST
4. **Get Credentials**:
   - Account SID and Auth Token from Console Dashboard
   - WhatsApp number (sandbox): `whatsapp:+14155238886`

### Option B: Meta WhatsApp Cloud API (Free, Production-Ready)

1. **Create Meta Developer Account**: [https://developers.facebook.com](https://developers.facebook.com)
2. **Create App**:
   - Dashboard → Create App → Business → WhatsApp
3. **Setup WhatsApp**:
   - Add WhatsApp product
   - Get test phone number or add your own
4. **Configure Webhook**:
   - Webhook URL: `https://your-domain.com/webhook/whatsapp`
   - Verify Token: (set your custom token)
   - Subscribe to: `messages`
5. **Get Credentials**:
   - Access Token (24hr or permanent)
   - Phone Number ID
   - App Secret

## 🌐 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set TWILIO_ACCOUNT_SID=your_sid
# ... set all other variables

# Deploy
git push heroku main
```

### Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables in Settings
5. Deploy!

### Deploy to Render

1. Go to [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Set environment variables
5. Deploy

## 📚 How to Use (User Guide)

Share this guide with your users:

### Getting Started

1. **Add the Bot**: Send "Hi" to the WhatsApp number
2. **Main Menu**: You'll see the main menu with options 1-7

### Buy Airtime

1. Type `1` or `airtime`
2. Select network (1-4)
3. Enter phone number
4. Enter amount (₦50 - ₦10,000)
5. Confirm purchase

### Buy Data

1. Type `2` or `data`
2. Select network (1-4)
3. Choose data plan
4. Enter phone number
5. Confirm purchase

### Sell Gift Card

1. Type `4` or `giftcard`
2. Select card type (iTunes, Amazon, etc.)
3. Enter card value in USD
4. Send card images
5. Enter card codes
6. Confirm and get paid instantly!

### Fund Wallet

1. Type `5` or `wallet`
2. Select option `1` (Fund Wallet)
3. Enter amount (₦100 - ₦500,000)
4. Choose payment method
5. Complete payment via link

### Commands

- `menu` - Return to main menu
- `cancel` - Cancel current operation
- `help` - Get help
- `history` - View transaction history
- `profile` - View your profile

## 🔧 Configuration

### Change WhatsApp Provider

In `.env`:
```env
WHATSAPP_PROVIDER=meta  # or twilio
```

### Add New Networks

Edit `handlers/airtime.handler.js` or `handlers/data.handler.js`:

```javascript
const NETWORKS = {
  '1': { name: 'MTN', code: 'mtn' },
  '2': { name: 'Glo', code: 'glo' },
  // Add more networks
};
```

### Update Data Plans

Edit `handlers/data.handler.js`:

```javascript
const DATA_PLANS = {
  'mtn': [
    { id: '1', name: '1GB - 7 days', code: 'mtn-1gb', price: 300 },
    // Add more plans
  ],
};
```

### Update Gift Card Rates

Edit `handlers/giftcard.handler.js`:

```javascript
const CARD_TYPES = {
  '1': { name: 'iTunes', code: 'itunes', rates: { 100: 350 } },
  // Update rates
};
```

## 🧪 Testing

### Test Without Real APIs (Demo Mode)

If you don't configure API keys, the bot runs in **demo mode** with simulated transactions:

```bash
# Just start without API keys
npm run dev
```

### Test with Ngrok (Local Development)

```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run dev

# In another terminal, expose to internet
ngrok http 3000

# Use the ngrok URL as your webhook
# Example: https://abc123.ngrok.io/webhook/whatsapp
```

### Test Messages

Send these to your bot:
- `hi` - Start conversation
- `1` - Buy airtime
- `2` - Buy data
- `menu` - Return to menu
- `help` - Get help

## 📁 Project Structure

```
whatsapp-commerce-bot/
├── config/              # Configuration files
│   ├── config.js        # Main configuration
│   ├── database.js      # Database connection
│   └── env.example.txt  # Environment template
├── models/              # Database models
│   ├── User.js          # User model
│   ├── Transaction.js   # Transaction model
│   └── Session.js       # Session model
├── services/            # External service integrations
│   ├── whatsapp.service.js   # WhatsApp messaging
│   ├── airtime.service.js    # Airtime provider
│   ├── data.service.js       # Data provider
│   ├── giftcard.service.js   # Gift card provider
│   └── payment.service.js    # Payment gateway
├── handlers/            # Message flow handlers
│   ├── message.handler.js    # Main message router
│   ├── menu.handler.js       # Menu displays
│   ├── airtime.handler.js    # Airtime flow
│   ├── data.handler.js       # Data flow
│   ├── giftcard.handler.js   # Gift card flow
│   └── wallet.handler.js     # Wallet flow
├── routes/              # API routes
│   └── whatsapp.routes.js    # WhatsApp webhook routes
├── controllers/         # Request controllers
│   └── whatsapp.controller.js
├── server.js            # Main server file
├── package.json         # Dependencies
└── README.md            # This file
```

## 🔐 Security Best Practices

1. **Never commit `.env`** - Add to `.gitignore`
2. **Use environment variables** - Don't hardcode credentials
3. **Enable webhook signature verification** - Verify incoming webhooks
4. **Use HTTPS** - Always use SSL in production
5. **Implement rate limiting** - Prevent abuse
6. **Validate inputs** - Sanitize all user inputs
7. **Monitor transactions** - Set up alerts for suspicious activity

## 🐛 Troubleshooting

### Bot not responding?

1. Check webhook URL is correct
2. Verify webhook is accessible (test with curl)
3. Check logs for errors
4. Ensure MongoDB is running
5. Verify API credentials

### Transactions failing?

1. Check service provider API keys
2. Verify sufficient balance with providers
3. Check network/phone number format
4. Review transaction logs in database

### Payment not working?

1. Verify payment gateway credentials
2. Check webhook URLs for payment callbacks
3. Test in sandbox/test mode first
4. Review payment provider documentation

## 📞 Support & Contact

For issues, questions, or contributions:

- **Email**: support@example.com
- **WhatsApp**: +234-XXX-XXX-XXXX
- **GitHub Issues**: [Create an issue]
- **Documentation**: [Wiki]

## 📄 License

This project is licensed under the ISC License.

## 🎯 Roadmap

- [ ] Add more payment methods
- [ ] Support more networks
- [ ] Cable TV subscriptions
- [ ] Electricity bill payments
- [ ] Multi-language support
- [ ] Web dashboard
- [ ] Analytics & reporting
- [ ] Referral system
- [ ] Admin panel

## 🙏 Acknowledgments

- Twilio for WhatsApp API
- Meta for WhatsApp Cloud API
- VTPass for service provisioning
- Paystack & Flutterwave for payments

---

**Built with ❤️ for seamless WhatsApp commerce**

Need help? Type `help` in the bot or contact support!




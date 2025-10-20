# 🚀 Complete Setup Guide

This guide will walk you through setting up your WhatsApp Commerce Bot step by step.

## Step 1: System Requirements ✅

Install these on your computer:

1. **Node.js** (v14+): [Download Node.js](https://nodejs.org/)
2. **MongoDB**: 
   - Local: [Download MongoDB](https://www.mongodb.com/try/download/community)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free)
3. **Git**: [Download Git](https://git-scm.com/)
4. **Code Editor**: [VS Code](https://code.visualstudio.com/) (recommended)

Check installations:
```bash
node --version  # Should show v14.0.0 or higher
npm --version   # Should show 6.0.0 or higher
mongo --version # If using local MongoDB
```

## Step 2: Get Your WhatsApp API Access 📱

### Option A: Twilio (Recommended for Beginners)

**Pros**: Easy setup, sandbox available, great for testing
**Cons**: Costs money in production, requires Twilio account

**Steps**:

1. **Sign Up**: Go to [Twilio](https://www.twilio.com/try-twilio)
   - Enter your details
   - Verify phone number
   - Skip the "build" step

2. **Access WhatsApp Sandbox**:
   - Go to Console → Messaging → Try it out → Try WhatsApp
   - You'll see: "Join your sandbox by sending: join <code>" to a number
   - Send that message from your WhatsApp to activate

3. **Get Your Credentials**:
   - **Account SID**: On your Console Dashboard (starts with AC...)
   - **Auth Token**: Click "show" on Dashboard (under Account SID)
   - **WhatsApp Number**: `whatsapp:+14155238886` (Twilio sandbox)

4. **Configure Webhook**:
   - Go to: Messaging → Settings → WhatsApp Sandbox Settings
   - WHEN A MESSAGE COMES IN: `https://your-domain.com/webhook/whatsapp`
   - Method: `HTTP POST`
   - Save

### Option B: Meta WhatsApp Cloud API (Free!)

**Pros**: Free, official, production-ready
**Cons**: More complex setup, requires business verification for scale

**Steps**:

1. **Create Meta Developer Account**:
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Create account or login

2. **Create App**:
   - Click "My Apps" → "Create App"
   - Select "Business" type
   - Fill in app name and contact email

3. **Add WhatsApp Product**:
   - In your app dashboard, click "Add Product"
   - Find "WhatsApp" and click "Set Up"

4. **Get Test Number**:
   - You'll see a test phone number provided by Meta
   - Or add your own WhatsApp Business number

5. **Get Credentials**:
   - **Phone Number ID**: In WhatsApp → API Setup
   - **Access Token**: Click "Generate Token" (24hr test token)
   - For permanent token: Create System User in Business Settings

6. **Configure Webhook**:
   - WhatsApp → Configuration → Edit
   - Callback URL: `https://your-domain.com/webhook/whatsapp`
   - Verify Token: Create your own (e.g., `mybot123456`)
   - Subscribe to: `messages`

## Step 3: Get Payment Gateway Access 💳

### Option A: Paystack (Nigerian/African Markets)

1. **Sign Up**: [Paystack.com](https://paystack.com)
2. **Get API Keys**:
   - Dashboard → Settings → API Keys & Webhooks
   - Copy **Secret Key** (starts with sk_test_ or sk_live_)
   - Copy **Public Key** (starts with pk_test_ or pk_live_)

### Option B: Flutterwave (Global)

1. **Sign Up**: [Flutterwave.com](https://flutterwave.com)
2. **Get API Keys**:
   - Dashboard → Settings → API
   - Copy **Secret Key**
   - Copy **Public Key**

## Step 4: Get Service Provider Access 📡

For buying airtime and data, you need a provider:

### Option A: VTPass

1. **Sign Up**: [VTPass.com](https://www.vtpass.com)
2. **Get API Credentials**:
   - Dashboard → API Settings
   - Copy **API Key**
   - Copy **Public Key**
   - Copy **Secret Key**
3. **Fund Account**: Add money to test

### Option B: Shago

1. **Sign Up**: Contact Shago for business account
2. **Get API Credentials**:
   - API Hash
   - Public Key
   - Private Key

**Note**: You can start without these (demo mode) for testing!

## Step 5: Project Setup 🛠️

### 5.1 Clone/Download Project

```bash
# If you have the code
cd whatsapp-commerce-bot

# Or clone from repository
git clone <your-repo-url>
cd whatsapp-commerce-bot
```

### 5.2 Install Dependencies

```bash
npm install
```

This will install all required packages. Wait for it to complete.

### 5.3 Configure Environment

```bash
# Create .env file
cp config/env.example.txt .env
```

Now edit `.env` file with your credentials:

```env
PORT=3000
NODE_ENV=development

# Choose your WhatsApp provider
WHATSAPP_PROVIDER=twilio

# If using Twilio:
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# If using Meta:
# WHATSAPP_PROVIDER=meta
# META_ACCESS_TOKEN=your_token
# META_PHONE_NUMBER_ID=your_phone_id
# META_VERIFY_TOKEN=mybot123456

# Database (use MongoDB Atlas URL or local)
MONGODB_URI=mongodb://localhost:27017/whatsapp-bot

# Payment (add your keys)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxx

# Service Providers (optional for demo)
VTPASS_API_KEY=your_api_key
VTPASS_SECRET_KEY=your_secret_key

# Your app URL (we'll set this up next)
APP_URL=http://localhost:3000
```

### 5.4 Setup Database

**Option A: Local MongoDB**
```bash
# Start MongoDB
mongod

# Keep this terminal open
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Get connection string
5. Replace `MONGODB_URI` in `.env`

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp-bot
```

## Step 6: Test Locally 🧪

### 6.1 Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 WhatsApp Bot Server running on port 3000
📱 WhatsApp Provider: twilio
🌐 Webhook URL: http://localhost:3000/webhook/whatsapp
```

### 6.2 Test API

Open browser: `http://localhost:3000`

You should see:
```json
{
  "status": "running",
  "message": "WhatsApp Commerce Bot API"
}
```

## Step 7: Expose to Internet 🌐

WhatsApp needs a public URL to send messages. Use **ngrok**:

### 7.1 Install ngrok

```bash
npm install -g ngrok

# Or download from: https://ngrok.com/download
```

### 7.2 Start ngrok

```bash
# In a new terminal (keep server running)
ngrok http 3000
```

You'll see:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3000
```

### 7.3 Update Webhook

Copy the `https://abc123.ngrok.io` URL and:

**For Twilio**:
- Go to WhatsApp Sandbox Settings
- Paste: `https://abc123.ngrok.io/webhook/whatsapp`
- Save

**For Meta**:
- Go to WhatsApp → Configuration
- Paste: `https://abc123.ngrok.io/webhook/whatsapp`
- Enter your verify token
- Verify and Save

### 7.4 Update .env

```env
APP_URL=https://abc123.ngrok.io
```

Restart your server.

## Step 8: Test Your Bot! 🎉

### 8.1 Send First Message

Open WhatsApp and send **"Hi"** to your bot number

You should receive:
```
👋 Welcome to WhatsApp Commerce Bot!

💰 Wallet Balance: ₦0

📋 Main Menu:
1️⃣ Buy Airtime
2️⃣ Buy Data
3️⃣ Buy Card/Bill Payment
4️⃣ Sell Gift Card
5️⃣ Wallet
...
```

### 8.2 Test Flows

**Test Airtime**:
1. Reply: `1`
2. Select network: `1` (MTN)
3. Enter phone: `08012345678`
4. Enter amount: `100`

**Test Data**:
1. Reply: `2`
2. Select network: `1`
3. Select plan: `1`
4. Enter phone: `08012345678`

**Test Gift Card**:
1. Reply: `4`
2. Select card: `1`
3. Enter value: `100`
4. Send image (any image for demo)
5. Type: `DONE`

## Step 9: Deploy to Production 🚀

### Option A: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create mywhatsappbot

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set TWILIO_ACCOUNT_SID=ACxxxx
heroku config:set TWILIO_AUTH_TOKEN=xxxxx
# ... set all variables

# Deploy
git push heroku main

# Get your app URL
heroku open
```

Your webhook: `https://mywhatsappbot.herokuapp.com/webhook/whatsapp`

### Option B: Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables in Settings → Variables
6. Copy deployment URL
7. Update webhook URLs

### Option C: Render

1. Go to [Render.com](https://render.com)
2. Sign up
3. New → Web Service
4. Connect GitHub repository
5. Add environment variables
6. Deploy
7. Copy service URL
8. Update webhooks

## Step 10: Customize & Launch 🎨

### Add Your Branding

Edit `handlers/menu.handler.js`:
```javascript
const menu = `
👋 *Welcome to YOUR BUSINESS NAME!*
...
```

### Update Support Info

Edit `handlers/menu.handler.js` in `sendHelp()`:
```javascript
*Need help?*
📞 Contact: 0800-YOUR-NUMBER
📧 Email: support@yourbusiness.com
```

### Set Real Rates

Update gift card rates in `handlers/giftcard.handler.js`

### Go Live!

1. Switch to production API keys
2. Update `NODE_ENV=production` in `.env`
3. Test all flows
4. Share your WhatsApp bot number!

## 🎯 Marketing Your Bot

1. **Add WhatsApp Button to Website**
2. **Share on Social Media**
3. **Create QR Code** (WhatsApp has this built-in)
4. **Add to Business Cards**
5. **Promote with First User Bonus**

## ⚠️ Common Issues

### "MongoDB connection error"
- Check if MongoDB is running
- Verify connection string
- Check network access (Atlas)

### "Webhook not receiving messages"
- Verify webhook URL is correct
- Check ngrok is running
- Test URL in browser: `/health` endpoint
- Check WhatsApp settings

### "Twilio auth error"
- Double-check Account SID
- Verify Auth Token
- Ensure no extra spaces

### "Transaction failed"
- Check service provider credentials
- Verify account balance with provider
- Check phone number format

## 📞 Need Help?

- Check `README.md` for detailed docs
- Review error logs
- Test in demo mode first
- Contact support

## 🎉 Congratulations!

Your WhatsApp Commerce Bot is ready! Start selling and accepting orders! 🚀

---

**Next Steps**:
- Monitor your first transactions
- Add more features
- Scale as you grow
- Consider adding admin dashboard






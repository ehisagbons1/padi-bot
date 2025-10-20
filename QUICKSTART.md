# 🚀 Quick Start Guide - WhatsApp Commerce Bot

## ✅ Prerequisites Checklist

- [x] Twilio Account Created
- [x] Account SID: `your_twilio_account_sid_here`
- [ ] Auth Token (from Twilio Console)
- [ ] Node.js installed
- [ ] MongoDB installed/running

---

## 📱 Step 1: Join Twilio WhatsApp Sandbox

Before anything else, you MUST join the Twilio Sandbox:

1. **Go to Twilio Console** → Messaging → Try it out → Send a WhatsApp message
2. You'll see a **sandbox code** like: `join capital-bridge` (example)
3. **Send this message** from your phone (`+2348155123611`):
   ```
   join your-sandbox-code
   ```
   Send to: `+14155238886` on WhatsApp

4. **Wait for confirmation**: Twilio will reply with "You are all set!"

---

## 🔧 Step 2: Get Your Auth Token

1. Go to: [Twilio Console Dashboard](https://console.twilio.com/)
2. Under **Account Info**, find your **Auth Token**
3. Click the 👁️ (eye icon) to reveal it
4. **Copy it** (it looks like: `abc123def456...`)

---

## ⚙️ Step 3: Create .env File

Create a file named `.env` in your project root:

```env
# Server
PORT=3000
NODE_ENV=development

# WhatsApp Provider
WHATSAPP_PROVIDER=twilio

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=paste_your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Database
MONGODB_URI=mongodb://localhost:27017/whatsapp-bot

# App URL
APP_URL=http://localhost:3000
```

**Important:** Replace `paste_your_auth_token_here` with your actual Auth Token!

---

## 🗄️ Step 4: Setup MongoDB Atlas (Cloud - FREE) ☁️

**Recommended: Use MongoDB Atlas (No installation needed!)**

1. Create account: https://www.mongodb.com/cloud/atlas
2. Create free cluster (takes 3-5 minutes)
3. Create database user with password
4. Whitelist IP: Allow access from anywhere (0.0.0.0/0)
5. Get connection string (Connect → Connect your application)
6. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/whatsapp-bot?retryWrites=true&w=majority
   ```

**📖 Detailed Guide:** See `MONGODB-ATLAS-SETUP.md`

**Test Connection:**
```bash
node test-mongodb.js
```

---

**Alternative - Local MongoDB:**
```bash
# If you prefer local installation
mongod
```

---

## 📦 Step 5: Install Dependencies

```bash
npm install
```

---

## 🧪 Step 6: Test Twilio Connection

Run the test script:

```bash
node test-twilio.js
```

**Expected output:**
```
✅ Test message sent successfully!
Message SID: SMxxxxxxxxxxxx
📱 Check your WhatsApp for the test message!
```

**If you see an error:**
- ❌ Auth Token wrong → Check Console
- ❌ Haven't joined sandbox → Follow Step 1

---

## 🚀 Step 7: Start Your Bot

```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

**Expected output:**
```
🚀 WhatsApp Bot Server running on port 3000
📱 WhatsApp Provider: twilio
🌐 Webhook URL: http://localhost:3000/webhook/whatsapp
📊 Environment: development
```

---

## 🔗 Step 8: Expose Webhook (for Testing)

Twilio needs a public URL to send messages to your bot.

### Option A: ngrok (Quick Testing)

```bash
# Install ngrok
npm install -g ngrok

# In a NEW terminal, expose port 3000
ngrok http 3000
```

You'll get a URL like: `https://abc123.ngrok.io`

### Option B: Deploy to Railway (Production)

1. Go to: https://railway.app
2. Sign in with GitHub
3. Click "New Project" → Deploy from GitHub
4. Select your repo
5. Add environment variables from your `.env`
6. Deploy! You'll get a URL like: `https://your-bot.up.railway.app`

---

## ⚙️ Step 9: Configure Twilio Webhook

1. **Twilio Console** → Messaging → Settings → WhatsApp Sandbox Settings
2. **When a message comes in:**
   ```
   https://your-ngrok-or-railway-url.com/webhook/whatsapp
   ```
3. **Method:** POST
4. **Click Save**

---

## 💬 Step 10: Test Your Bot!

Send a message to `+14155238886` on WhatsApp:

```
Hi
```

**Expected response:**
```
👋 Welcome to WhatsApp Commerce Bot!

💰 Wallet Balance: ₦0

📋 Main Menu:
1️⃣ Buy Airtime
2️⃣ Buy Data
3️⃣ Buy Card/Bill Payment
4️⃣ Sell Gift Card
5️⃣ Wallet
6️⃣ Transaction History
7️⃣ Profile
0️⃣ Help

Reply with a number (1-7) or type *help* for assistance.
```

---

## 🎉 Success!

Your bot is now running in **DEMO MODE**! Try:
- Type `1` → Buy airtime (simulated)
- Type `4` → Sell gift card (simulated)
- Type `5` → Check wallet

**Demo mode** means transactions are simulated (no real money). To enable real transactions, add API keys:
- VTPass (airtime/data)
- Paystack/Flutterwave (payments)

---

## 🐛 Troubleshooting

### Bot not responding?

1. ✅ Check bot is running: `npm run dev`
2. ✅ Check webhook URL is correct in Twilio Console
3. ✅ Check logs in terminal for errors
4. ✅ Make sure you joined the sandbox (Step 1)

### Database errors?

1. ✅ MongoDB is running: `mongod` or check service
2. ✅ Connection string is correct in `.env`

### Auth errors?

1. ✅ Copy-paste Auth Token carefully (no spaces)
2. ✅ Token is from same account as Account SID

---

## 📚 What's Next?

1. **Test all features** (airtime, data, giftcard)
2. **Set up real providers**:
   - VTPass: https://vtpass.com/
   - Paystack: https://paystack.com/
3. **Deploy to production** (Railway/Render)
4. **Switch to Meta WhatsApp API** (free!) when ready

---

## 🆘 Need Help?

- Check terminal logs for errors
- Review `README.md` for detailed documentation
- Test with: `node test-twilio.js`

---

**Your Current Setup:**
- Account SID: `your_twilio_account_sid_here`
- Test Number: `your_phone_number`
- Sandbox Number: `+14155238886`

🎯 **You're ready to go! Just add your Auth Token and start testing!**


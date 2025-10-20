# ✅ Setup Checklist

Follow these steps in order:

## 1. Get Twilio Auth Token
- [ ] Go to [Twilio Console](https://console.twilio.com/)
- [ ] Find "Auth Token" under Account Info
- [ ] Click 👁️ icon to reveal it
- [ ] Copy the token

## 2. Join Twilio Sandbox
- [ ] Open WhatsApp on phone (`+2348155123611`)
- [ ] Send message to `+14155238886`
- [ ] Twilio Console → Messaging → Try it out → See sandbox code
- [ ] Send: `join your-sandbox-code` to `+14155238886`
- [ ] Wait for "You are all set!" confirmation

## 3. Create .env File
- [ ] Create `.env` file in project root
- [ ] Copy template from `QUICKSTART.md`
- [ ] Paste your Auth Token
- [ ] Save file

## 4. Setup MongoDB
Choose ONE option:

**Option A - Local:**
- [ ] Install MongoDB if not installed
- [ ] Run `mongod` in terminal

**Option B - Cloud (Recommended):**
- [ ] Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create free cluster
- [ ] Get connection string
- [ ] Update `MONGODB_URI` in `.env`

## 5. Install & Test
- [ ] Run: `npm install`
- [ ] Run: `node test-twilio.js`
- [ ] ✅ Confirm test message received on WhatsApp

## 6. Start Bot
- [ ] Run: `npm run dev`
- [ ] ✅ See "🚀 WhatsApp Bot Server running"

## 7. Setup Webhook (Choose ONE)

**Option A - ngrok (Local Testing):**
- [ ] Install: `npm install -g ngrok`
- [ ] Run: `ngrok http 3000`
- [ ] Copy the `https://` URL

**Option B - Railway (Production):**
- [ ] Deploy to [Railway.app](https://railway.app)
- [ ] Add all `.env` variables
- [ ] Copy deployment URL

## 8. Configure Twilio
- [ ] Twilio Console → Messaging → WhatsApp Sandbox Settings
- [ ] Set "When a message comes in" to: `https://your-url/webhook/whatsapp`
- [ ] Method: POST
- [ ] Save

## 9. Test Bot
- [ ] Send "Hi" to `+14155238886` on WhatsApp
- [ ] ✅ Receive menu response
- [ ] Try: Type `1` (Buy Airtime)
- [ ] Try: Type `4` (Sell Gift Card)

---

## 🎯 Current Status

**What you have:**
- ✅ Twilio Account
- ✅ Account SID: `your_twilio_account_sid_here`
- ✅ Sandbox Number: `+14155238886`
- ✅ Test Number: `+2348155123611`
- ✅ Code downloaded
- ✅ Dependencies in package.json

**What you need:**
- ⏳ Auth Token from Console
- ⏳ Join Twilio Sandbox
- ⏳ Create .env file
- ⏳ Start MongoDB

---

## 📝 Quick Commands Reference

```bash
# Test Twilio connection
node test-twilio.js

# Start bot (development)
npm run dev

# Start bot (production)
npm start

# Expose local server
ngrok http 3000

# Check if MongoDB is running
mongo --version
```

---

## 🆘 Common Issues

**"Authentication Error"**
→ Check Auth Token in .env (no spaces, quotes)

**"Bot not responding"**
→ 1. Check bot is running
→ 2. Check webhook URL in Twilio Console
→ 3. Check terminal for errors

**"Connection failed to MongoDB"**
→ Make sure MongoDB is running: `mongod`

**"Haven't joined sandbox"**
→ Send `join <code>` to +14155238886 first

---

## 🎉 All Done?

Once everything works:
1. Read `README.md` for full features
2. Test all bot functions
3. Deploy to production
4. Consider switching to Meta WhatsApp API (free!)

**Your bot is in DEMO MODE** - transactions are simulated. To enable real purchases:
- Add VTPass API keys (airtime/data)
- Add Paystack keys (payments)


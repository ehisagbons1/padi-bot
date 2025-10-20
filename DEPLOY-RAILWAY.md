# 🚂 Deploy to Railway - Complete Guide

**Railway is the EASIEST deployment option!** No GitHub token needed, no complex setup.

---

## 🚀 Step-by-Step Deployment

### **Step 1: Sign Up for Railway**

1. Go to: **https://railway.app/**
2. Click **"Login"** or **"Start a New Project"**
3. **Sign up with:**
   - GitHub account (recommended - easier)
   - OR Email

---

### **Step 2: Connect GitHub (If Using GitHub Login)**

1. After signup, click **"New Project"**
2. Click **"Deploy from GitHub repo"**
3. If first time: Click **"Configure GitHub App"**
4. Select **"Only select repositories"**
5. Choose: **ehisagbons1/padi-bot**
6. Click **"Install & Authorize"**
7. Back on Railway, select **padi-bot** repository

**Railway will automatically:**
- Detect it's a Node.js app
- Run `npm install`
- Run `npm start`

---

### **Step 3: Add Environment Variables**

**CRITICAL:** Your bot needs these to work!

1. In Railway dashboard, click your **service name**
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. Add these **ONE BY ONE:**

```
NODE_ENV=production
```
Click "Add" then add next one:

```
PORT=3000
```

Continue adding:

```
WHATSAPP_PROVIDER=twilio
```

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
```

```
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
```

```
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

```
MONGODB_URI=your_mongodb_connection_string_here
```

```
SESSION_SECRET=my-super-secret-key-change-this-123
```

```
APP_URL=https://YOUR-APP.up.railway.app
```
*(We'll update this after deployment)*

---

### **Step 4: Deploy**

1. Railway will **automatically deploy** after you add variables
2. Wait 2-3 minutes for build to complete
3. Look for **"Success"** message

---

### **Step 5: Get Your URL**

1. In Railway dashboard, go to **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. You'll get a URL like: `https://padi-bot-production.up.railway.app`
5. **Copy this URL!**

---

### **Step 6: Update APP_URL Variable**

1. Go back to **"Variables"** tab
2. Find **APP_URL**
3. Click to edit
4. Change to your Railway URL:
   ```
   https://padi-bot-production.up.railway.app
   ```
5. App will redeploy automatically

---

### **Step 7: Initialize Admin on Railway**

You need to run the init-admin script once on Railway:

**Option A - Via Railway CLI:**
```bash
railway login
railway run npm run init-admin
```

**Option B - Temporary Start Command:**
1. Railway Dashboard → Settings → Deploy
2. Change **Start Command** temporarily to:
   ```
   npm run init-admin && npm start
   ```
3. Trigger redeploy
4. After admin created, change back to: `npm start`

**Option C - Use Local Script (Simplest):**
Just run this locally (it will create admin on Railway's database):
```bash
npm run init-admin
```
*(It uses the same MongoDB Atlas, so admin will be available on Railway)*

---

### **Step 8: Configure Twilio Webhook**

1. **Go to:** https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox
2. **Find:** "When a message comes in"
3. **Enter:**
   ```
   https://padi-bot-production.up.railway.app/webhook/whatsapp
   ```
   *(Replace with YOUR Railway URL)*
4. **Method:** POST
5. **Click:** Save

---

### **Step 9: Test Everything!**

#### **Test WhatsApp Bot:**
Send "Hi" to `+14155238886` on WhatsApp

**You should see:**
```
👋boyoyo

💰 Wallet Balance: ₦0

📋 Main Menu:
1️⃣ Buy Airtime
...
```

#### **Test Admin Dashboard:**
1. Open: `https://YOUR-RAILWAY-URL.up.railway.app/admin`
2. Login: `admin` / `admin123`
3. See your dashboard!

---

## ✅ Success Checklist

- [ ] Railway account created
- [ ] Project connected to GitHub (or created manually)
- [ ] All environment variables added
- [ ] Domain generated
- [ ] APP_URL variable updated
- [ ] Admin initialized (run `npm run init-admin` locally)
- [ ] Twilio webhook configured
- [ ] Test message sent to bot - ✅ Works!
- [ ] Admin dashboard accessible - ✅ Works!

---

## 🎯 What You Get

Once deployed:
- ✅ **Bot online 24/7**
- ✅ **Permanent URL** (doesn't change)
- ✅ **Admin dashboard accessible** from anywhere
- ✅ **Automatic SSL** (HTTPS)
- ✅ **Auto-restarts** on crashes
- ✅ **Free tier** - 500 hours/month (always on)

---

## 📊 Railway Dashboard

After deployment, you can:
- View logs (see bot activity)
- Monitor resources
- Manage environment variables
- View deployments
- Enable metrics

---

## 🐛 Troubleshooting

**"Build failed"**
- Check all environment variables are set
- Check for typos in values

**"Application error"**
- Check logs in Railway dashboard
- Verify MongoDB URI is correct
- Verify Twilio credentials

**"Webhook not working"**
- Check webhook URL in Twilio
- Make sure it ends with `/webhook/whatsapp`
- Check Railway app is running (not sleeping)

---

## 💰 Railway Pricing

**Free Tier:**
- 500 hours/month of usage
- $5 credit each month
- Perfect for small projects
- Enough for 24/7 operation on free tier!

---

## 🔄 Update Your App

After changes:
```bash
git add .
git commit -m "Update message"
git push
```

Railway auto-deploys! ✅

---

**Start here: https://railway.app/** 🚀




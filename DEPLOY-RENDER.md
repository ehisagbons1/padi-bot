# 🎨 Deploy to Render - Complete Guide

**Render is a powerful, modern cloud platform with a generous free tier!**

---

## 🚀 Step-by-Step Deployment

### **Step 1: Sign Up for Render**

1. Go to: **https://render.com/**
2. Click **"Get Started"** or **"Sign Up"**
3. **Sign up with:**
   - GitHub account (recommended - easier)
   - GitLab account
   - OR Email

---

### **Step 2: Push Your Code to GitHub**

Make sure your code is on GitHub first:

```bash
# If not already pushed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

### **Step 3: Create a New Web Service**

1. After login, click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. If first time: Click **"Configure GitHub"**
5. Select your repository: **ehisagbons1/padi-bot**
6. Click **"Connect"**

---

### **Step 4: Configure Web Service**

Render will auto-detect your Node.js app. Configure these settings:

**Basic Settings:**
- **Name:** `padi-bot` (or your preferred name)
- **Region:** Choose closest to your users (e.g., Frankfurt/Oregon)
- **Branch:** `main`
- **Root Directory:** (leave blank)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Select **"Free"** (sufficient for testing)
- Or **"Starter"** for production ($7/month - better performance)

---

### **Step 5: Add Environment Variables**

**CRITICAL:** Scroll down to **"Environment Variables"** section and add these:

Click **"Add Environment Variable"** for each:

```env
NODE_ENV=production
```

```env
PORT=10000
```
*(Render uses port 10000 by default, or use $PORT)*

```env
WHATSAPP_PROVIDER=twilio
```

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
```

```env
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
```

```env
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

```env
MONGODB_URI=your_mongodb_connection_string_here
```

```env
SESSION_SECRET=my-super-secret-key-change-this-in-production-xyz789
```

```env
APP_URL=https://YOUR-APP-NAME.onrender.com
```
*(We'll update this after deployment)*

**Optional (Add if you have these services configured):**
```env
PAYSTACK_SECRET_KEY=sk_test_xxxxx
VTPASS_API_KEY=your_api_key
VTPASS_SECRET_KEY=your_secret_key
```

---

### **Step 6: Deploy**

1. Scroll to bottom
2. Click **"Create Web Service"**
3. Render will:
   - Clone your repo
   - Run `npm install`
   - Run `npm start`
   - Assign you a URL

**Wait 3-5 minutes** for the first deployment.

---

### **Step 7: Get Your URL**

1. After deployment completes, you'll see your URL at the top:
   ```
   https://padi-bot.onrender.com
   ```
2. **Copy this URL!**
3. Test it by visiting: `https://padi-bot.onrender.com`
   
   You should see:
   ```json
   {
     "status": "running",
     "message": "WhatsApp Commerce Bot API",
     "timestamp": "2025-10-20T..."
   }
   ```

---

### **Step 8: Update APP_URL Variable**

1. In Render dashboard, click **"Environment"** in left sidebar
2. Find **APP_URL** variable
3. Click **"Edit"**
4. Update to your actual Render URL:
   ```
   https://padi-bot.onrender.com
   ```
5. Click **"Save Changes"**
6. App will redeploy automatically (takes ~2 minutes)

---

### **Step 9: Initialize Admin Account**

You need to create the admin account once:

**Option A - Run Locally (Simplest):**
```bash
npm run init-admin
```
*(Creates admin in MongoDB Atlas, available everywhere)*

**Option B - Via Render Shell:**
1. In Render dashboard, click **"Shell"** tab
2. Wait for shell to connect
3. Run:
   ```bash
   npm run init-admin
   ```
4. You'll see: "Admin user created successfully!"

---

### **Step 10: Configure Twilio Webhook**

1. **Go to:** https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox
2. **Find:** "When a message comes in"
3. **Enter:**
   ```
   https://padi-bot.onrender.com/webhook/whatsapp
   ```
   *(Replace with YOUR Render URL)*
4. **Method:** POST
5. **Click:** Save

---

### **Step 11: Test Everything!**

#### **Test WhatsApp Bot:**
1. Send "Hi" to `+14155238886` on WhatsApp
2. **You should see:**
   ```
   👋 Welcome!
   
   💰 Wallet Balance: ₦0
   
   📋 Main Menu:
   1️⃣ Buy Airtime
   2️⃣ Buy Data
   3️⃣ Buy Card
   4️⃣ Sell Gift Card
   5️⃣ My Wallet
   6️⃣ Transaction History
   7️⃣ Help & Support
   ```

#### **Test Admin Dashboard:**
1. Open: `https://padi-bot.onrender.com/admin`
2. Login credentials:
   - Username: `admin`
   - Password: `admin123`
3. You should see the admin dashboard with stats!

---

## ✅ Success Checklist

- [ ] Render account created
- [ ] Repository connected from GitHub
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] APP_URL variable updated with actual URL
- [ ] Admin account initialized (`npm run init-admin`)
- [ ] Twilio webhook configured with Render URL
- [ ] Test message sent to bot - ✅ Works!
- [ ] Admin dashboard accessible - ✅ Works!

---

## 🎯 What You Get with Render

**Free Tier Benefits:**
- ✅ **750 hours/month** free compute time
- ✅ **Automatic SSL/HTTPS** 
- ✅ **Auto-deploy** on git push
- ✅ **Global CDN**
- ✅ **Automatic health checks**
- ✅ **Zero-downtime deploys**
- ✅ **Built-in metrics & logs**

**Note:** Free tier services spin down after 15 minutes of inactivity. First request after may take 30-60 seconds.

**Upgrade to Starter ($7/month) for:**
- ✅ **Always on** - No spin down
- ✅ **Faster performance**
- ✅ **Better for production**

---

## 📊 Render Dashboard Features

After deployment, you can:

**Logs Tab:**
- View real-time application logs
- See incoming WhatsApp messages
- Debug issues

**Metrics Tab:**
- CPU usage
- Memory usage
- Response times
- Request counts

**Events Tab:**
- Deployment history
- Build logs
- Errors & warnings

**Shell Tab:**
- SSH into your app
- Run commands directly
- Run scripts (like init-admin)

**Environment Tab:**
- Manage environment variables
- Add/edit/delete secrets

---

## 🔄 Auto-Deploy on Push

After initial setup, updates are automatic:

```bash
# Make changes to your code
git add .
git commit -m "Added new feature"
git push origin main
```

**Render automatically:**
1. Detects the push
2. Builds your app
3. Runs tests (if configured)
4. Deploys new version
5. No downtime! 🎉

---

## 🐛 Troubleshooting

### **"Build failed"**
- Check **Logs** tab for build errors
- Verify all dependencies in `package.json`
- Check Node.js version compatibility

### **"Application failed to respond"**
**Solution:**
1. Check logs for errors
2. Verify MongoDB URI is correct and accessible
3. Ensure PORT is set correctly (Render uses 10000 or $PORT)
4. In `server.js`, make sure you're listening on:
   ```javascript
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

### **"Service unavailable" or "502 Bad Gateway"**
- Service might be spinning up (free tier)
- Wait 30-60 seconds and refresh
- Check if service is running in dashboard

### **"Webhook not receiving messages"**
- Verify webhook URL in Twilio console
- Check it ends with `/webhook/whatsapp`
- Check Render service is running (not suspended)
- Look at Render logs when sending test message

### **"Database connection failed"**
- Verify MongoDB Atlas is accessible
- Check if IP whitelist includes `0.0.0.0/0` (allow all)
- Verify MongoDB URI format
- Test connection with `mongoose.connect()`

### **"Admin dashboard 404"**
- Ensure static files are being served
- Check `server.js` has:
   ```javascript
   app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
   ```
- Verify `public/admin/` files exist

---

## 💡 Pro Tips

### **Prevent Free Tier Sleep**
Create a free cron job to ping your service every 14 minutes:

1. Use **cron-job.org** (free)
2. Create job: `https://padi-bot.onrender.com/health`
3. Schedule: Every 14 minutes
4. Your service stays awake!

### **Custom Domain**
1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Render: Settings → Custom Domain
3. Add your domain
4. Update DNS records as instructed
5. SSL auto-configured! 🎉

### **Environment Variables from File**
Instead of adding one-by-one, you can:
1. Create `.env` file locally
2. Copy all values
3. In Render: Environment → "Add from .env file"
4. Paste and save

### **Monitor Uptime**
Use free monitoring:
- **UptimeRobot** (https://uptimerobot.com)
- **Better Uptime** (https://betteruptime.com)
- Set up alerts for downtime

---

## 📈 Scaling Your App

### **When to upgrade from Free?**
- High traffic (>100 requests/hour consistently)
- Need 24/7 availability
- Users complaining about slow first response
- Running in production with paying customers

### **Upgrading:**
1. Dashboard → Settings
2. Scroll to "Instance Type"
3. Select "Starter" ($7/month)
4. Click "Upgrade"
5. Done! ✅

### **Horizontal Scaling:**
For high traffic:
1. Settings → "Scaling"
2. Increase instance count
3. Load balancing automatic

---

## 🔐 Security Best Practices

✅ **Never commit `.env`** - Already in `.gitignore`
✅ **Use environment variables** - All secrets in Render dashboard
✅ **Enable Render health checks** - Auto-restarts on failures
✅ **Monitor logs regularly** - Check for suspicious activity
✅ **Use strong SESSION_SECRET** - Change default value
✅ **Keep dependencies updated** - Run `npm audit fix` regularly
✅ **Use HTTPS only** - Render provides free SSL

---

## 💰 Render Pricing

**Free Tier:**
- 750 hours/month
- Spins down after 15 min inactivity
- 0.5 GB RAM
- Perfect for testing & development

**Starter Tier ($7/month):**
- Always on
- 512 MB RAM
- Better performance
- Recommended for production

**Pro Tier ($25/month):**
- 2 GB RAM
- Priority support
- Advanced features

See: https://render.com/pricing

---

## 🆚 Render vs Railway vs Heroku

| Feature | Render | Railway | Heroku |
|---------|--------|---------|--------|
| Free Tier | 750h/month | 500h/month | Deprecated |
| Auto-deploy | ✅ | ✅ | ✅ |
| SSL | Free | Free | Free |
| Sleep time | 15 min | Instant | N/A |
| Logs | Excellent | Good | Good |
| Ease of use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Startup time | Fast | Faster | Fast |

**Recommendation:** Both Render and Railway are excellent. Choose Render if you want better logging/monitoring and don't mind the 15-min sleep time.

---

## 📚 Additional Resources

- **Render Docs:** https://render.com/docs
- **Node.js Guides:** https://render.com/docs/deploy-node-express-app
- **Twilio Webhooks:** https://www.twilio.com/docs/usage/webhooks
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/

---

## 🎉 Next Steps

After successful deployment:

1. **Share your bot number** with users
2. **Monitor performance** in Render dashboard
3. **Set up uptime monitoring**
4. **Configure custom domain** (optional)
5. **Set up alerts** for errors
6. **Upgrade to Starter** when ready for production

---

## 🆘 Need Help?

If you encounter issues:

1. Check **Logs** tab in Render dashboard
2. Review this guide's Troubleshooting section
3. Check Render status: https://status.render.com
4. Visit Render community: https://community.render.com

---

**Start deploying: https://render.com/** 🎨

**Your app will be live at: `https://YOUR-APP-NAME.onrender.com`** 🚀

---

## 🔄 Quick Deploy Checklist

```bash
# 1. Commit and push your code
git add .
git commit -m "Ready for Render deployment"
git push origin main

# 2. Go to Render.com and create Web Service

# 3. Configure environment variables (see Step 5)

# 4. Deploy and wait 3-5 minutes

# 5. Update APP_URL with your Render URL

# 6. Initialize admin
npm run init-admin

# 7. Configure Twilio webhook with Render URL

# 8. Test by sending "Hi" to WhatsApp number

# 🎉 You're live!
```

---

**Built with ❤️ for seamless deployment**

Need help? Check the troubleshooting section above! 🚀


# 🗄️ MongoDB Atlas Setup Guide

MongoDB Atlas is the **FREE cloud database** from MongoDB. No installation needed!

---

## 🚀 Quick Setup (5 minutes)

### 1. Create Account

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up (free, no credit card required)
3. Verify your email

---

### 2. Create Free Cluster

1. Click **"Build a Database"** or **"Create"**
2. Choose **"Shared"** (FREE tier)
3. Select:
   - **Provider**: AWS (or any)
   - **Region**: Closest to Nigeria (e.g., Frankfurt, London)
4. **Cluster Name**: Leave default or name it `whatsapp-bot`
5. Click **"Create Cluster"** (takes 3-5 minutes)

---

### 3. Create Database User

1. Click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set:
   - **Username**: e.g., `bot_user`
   - **Password**: Create strong password (save it!)
   - **Role**: `Read and write to any database`
5. Click **"Add User"**

---

### 4. Whitelist IP Address

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For testing, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - *For production, restrict to your server IP*
4. Click **"Confirm"**

---

### 5. Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select:
   - **Driver**: Node.js
   - **Version**: 4.1 or later
5. **Copy the connection string**:
   ```
   mongodb+srv://bot_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

### 6. Update Your .env File

1. Open your `.env` file
2. Replace the `MONGODB_URI` line with your connection string
3. **Important changes**:
   - Replace `<password>` with your actual database password
   - Add `/whatsapp-bot` before the `?` to specify database name

**Example:**

```env
# Before:
MONGODB_URI=mongodb://localhost:27017/whatsapp-bot

# After (with your actual credentials):
MONGODB_URI=mongodb+srv://bot_user:YourPassword123@cluster0.abc123.mongodb.net/whatsapp-bot?retryWrites=true&w=majority
```

**Full .env example:**

```env
PORT=3000
NODE_ENV=development
WHATSAPP_PROVIDER=twilio

TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

MONGODB_URI=mongodb+srv://bot_user:YourPassword123@cluster0.abc123.mongodb.net/whatsapp-bot?retryWrites=true&w=majority

APP_URL=http://localhost:3000
```

---

### 7. Test Connection

Run the test script:

```bash
node test-mongodb.js
```

**Expected output:**

```
✅ MongoDB Atlas connected successfully!
📊 Database: whatsapp-bot
🌐 Host: cluster0-shard-00-00.xxxxx.mongodb.net
🎉 Your database is ready to use!
```

---

## ✅ Verify Setup

Now start your bot:

```bash
npm run dev
```

You should see:

```
✅ MongoDB connected successfully
🚀 WhatsApp Bot Server running on port 3000
📱 WhatsApp Provider: twilio
```

---

## 🐛 Common Issues

### ❌ "MongoNetworkError: connection refused"

**Fix:**
1. Check IP whitelist (allow 0.0.0.0/0 for testing)
2. Check internet connection
3. Wait 3-5 minutes after creating cluster

### ❌ "Authentication failed"

**Fix:**
1. Check username and password are correct
2. Remove any special characters from password (or URL encode them)
3. Make sure database user has "Read and write" permissions

### ❌ "Connection string is not valid"

**Fix:**
1. Make sure to replace `<password>` with actual password
2. Add database name: `/whatsapp-bot` before the `?`
3. Check no extra spaces in connection string

### ❌ "Could not connect to any servers"

**Fix:**
1. Cluster might still be creating (wait 5 minutes)
2. Check Network Access settings
3. Try different region (closer to you)

---

## 🎯 Your MongoDB Atlas Setup

**Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Your Values:**
- **USERNAME**: (your database user, e.g., `bot_user`)
- **PASSWORD**: (your database password)
- **CLUSTER**: (e.g., `cluster0.abc123`)
- **DATABASE_NAME**: `whatsapp-bot`

---

## 📊 View Your Data

1. Go to MongoDB Atlas Dashboard
2. Click **"Browse Collections"**
3. See your data:
   - `users` - All WhatsApp users
   - `transactions` - All purchases/sales
   - `sessions` - Active conversation sessions

---

## 💡 Why MongoDB Atlas?

✅ **FREE** - 512MB storage free forever  
✅ **No installation** - Cloud-based  
✅ **Automatic backups** - Data is safe  
✅ **Global** - Fast from anywhere  
✅ **Scalable** - Upgrade when needed  

---

## 🚀 Next Steps

1. ✅ MongoDB Atlas connected
2. Test your bot: `npm run dev`
3. Send "Hi" to your WhatsApp bot
4. Check MongoDB Atlas → "Browse Collections" to see user data

---

## 📚 Resources

- MongoDB Atlas Dashboard: https://cloud.mongodb.com/
- Connection String Guide: https://www.mongodb.com/docs/manual/reference/connection-string/
- Atlas Free Tier: https://www.mongodb.com/pricing

---

**You're all set! Your bot now uses MongoDB Atlas cloud database!** 🎉


# 🚀 Admin Dashboard - Quick Start (5 Minutes)

## Step 1: Initialize Admin Account

```bash
npm run init-admin
```

**Output:**
```
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Username: admin
🔑 Password: admin123
📧 Email: admin@whatsapp-bot.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 2: Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Step 3: Access Dashboard

**Open browser:**
```
http://localhost:3000/admin
```

**Login:**
- Username: `admin`
- Password: `admin123`

---

## Step 4: Explore!

### ✅ Dashboard
- See user stats
- View recent transactions
- Check pending gift cards

### ✅ Gift Cards Page
- See pending submissions
- **View card images** 📸
- Approve or reject

### ✅ Products Page
- See sample products (iTunes, Amazon, etc.)
- Edit rates
- Add new products

### ✅ Settings Page
- Change bot name
- Update welcome message
- Enable/disable services

---

## 🎯 Try These First:

### 1. Change Bot Name
1. Go to **Settings**
2. Edit "Bot Name" (e.g., "Padi Bot")
3. Click **💾 Save Settings**
4. Test: Send "Hi" to bot on WhatsApp
5. See new name in welcome message!

### 2. Update iTunes Rate
1. Go to **Products**
2. Find iTunes card
3. Click **Edit**
4. Change $100 rate to ₦40,000
5. Save
6. Test: User sells $100 iTunes → gets ₦40,000!

### 3. Simulate Gift Card Approval
**(When users start submitting cards)**
1. Go to **Gift Cards**
2. See pending submission
3. Click images to view
4. Click **✅ Approve**
5. User wallet credited instantly!

---

## 📊 What You Can Manage

- ✅ **Users** - View, search, credit/debit wallets
- ✅ **Transactions** - Filter, view details
- ✅ **Gift Cards** - Approve with image viewing
- ✅ **Products** - Add, edit rates
- ✅ **Data Plans** - Manage plans & prices
- ✅ **Settings** - Bot name, messages, services

---

## ⚠️ Important

**Change your password!**

For now, change via database or in `scripts/init-admin.js`:

```javascript
admin.setPassword('your-new-secure-password');
```

---

## 📱 Access from Phone

1. Get your computer's IP:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Open on phone:
   ```
   http://YOUR-IP:3000/admin
   ```
   Example: `http://192.168.1.10:3000/admin`

---

## 🐛 Troubleshooting

**"Cannot access dashboard"**
- Check server is running: `npm run dev`
- Check URL: `http://localhost:3000/admin`

**"Login failed"**
- Username: `admin` (lowercase)
- Password: `admin123`
- Did you run `npm run init-admin`?

**"Images not showing"**
- Check `uploads/giftcards/` folder exists
- Server will create it automatically

---

## 📖 Full Documentation

- **Setup Guide**: `ADMIN-DASHBOARD-GUIDE.md`
- **Features List**: `ADMIN-FEATURES-SUMMARY.md`
- **Quick Start**: This file!

---

## 🎉 You're Ready!

Your admin dashboard is fully functional with:
- ✅ User management
- ✅ Transaction tracking
- ✅ Gift card approval with image viewing
- ✅ Dynamic price management
- ✅ Settings control

**Start managing your WhatsApp bot like a pro!** 🚀


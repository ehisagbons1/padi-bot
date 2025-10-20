# 🎛️ Admin Dashboard Guide

Complete guide to setting up and using the Admin Dashboard for your WhatsApp Commerce Bot.

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

This will install the new `express-session` dependency.

### 2. Initialize Admin Account

```bash
npm run init-admin
```

**This will create:**
- ✅ First admin user (username: `admin`, password: `admin123`)
- ✅ Default settings in database
- ✅ Sample gift card products (iTunes, Amazon, Google Play, Steam)

**Output:**
```
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Username: admin
🔑 Password: admin123
📧 Email: admin@whatsapp-bot.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ IMPORTANT: Change this password immediately after first login!
```

### 3. Start Server

```bash
npm run dev
```

### 4. Access Admin Dashboard

Open your browser:
```
http://localhost:3000/admin
```

**Login with:**
- Username: `admin`
- Password: `admin123`

---

## 📊 Dashboard Features

### 1. **Dashboard Home**
- Total users count
- Transaction statistics
- Revenue tracking (today & total)
- Pending gift cards count
- Recent transactions table

### 2. **User Management** 👥
- View all users
- Search by phone number or name
- View user details & transaction history
- **Credit/Debit user wallet** manually
- Block/unblock users
- View user statistics

**Use Cases:**
- Manually credit bonus to users
- Refund failed transactions
- Resolve payment issues

### 3. **Transactions** 💳
- View all transactions
- Filter by type (airtime, data, gift card, wallet)
- Filter by status (completed, processing, failed)
- Filter by date range
- View transaction details
- Export reports

### 4. **Gift Cards Approval** 🎁
- View pending gift card submissions
- **See uploaded card images** 📸
- Zoom in on images to verify
- Approve or reject cards
- Add approval/rejection notes
- User gets instant payment on approval

**Image Viewing:**
- Click any image to open in new tab
- Multiple images per card
- High resolution viewing

### 5. **Gift Card Products** 📦
- Add new card types
- Edit existing products
- Set rates for different values
- Set default rate (for non-standard values)
- Enable/disable products
- Delete products

**Example:**
```
iTunes Gift Card:
- $100 = ₦35,000
- $200 = ₦70,000
- $500 = ₦175,000
- Default Rate: ×350 (for other values)
```

### 6. **Data Plans** 📶
- Add data plans for each network
- Edit prices and plans
- Set your cost price (for profit tracking)
- Enable/disable plans
- View profit margins

**Example:**
```
MTN 1GB - 30 Days:
- Price: ₦300
- Cost: ₦280
- Profit: ₦20
```

### 7. **Settings** ⚙️

**Bot Configuration:**
- Bot Name (shown in WhatsApp)
- Welcome Message
- Support Phone
- Support Email

**Service Status:**
- Enable/Disable Airtime
- Enable/Disable Data
- Enable/Disable Gift Cards
- Enable/Disable Wallet

**Maintenance Mode:**
- Enable maintenance mode
- Custom maintenance message
- Users see message instead of menu

---

## 🎯 Common Admin Tasks

### Task 1: Update Gift Card Rates

1. Go to **Products** → Gift Card Products
2. Click **Edit** on the card
3. Update rates
4. Click **Save**
5. ✅ Users see new rates immediately!

### Task 2: Approve Gift Card

1. Go to **Gift Cards**
2. Review card details
3. Click images to view full size
4. Verify card is legit
5. Click **✅ Approve** or **❌ Reject**
6. Add note (optional)
7. User wallet credited instantly on approval

### Task 3: Credit User Wallet

1. Go to **Users**
2. Search for user
3. Click **View**
4. Click **Credit Wallet**
5. Enter amount
6. Add note (e.g., "Refund for TX123")
7. User sees updated balance instantly

### Task 4: Add New Gift Card Type

1. Go to **Products**
2. Click **+ Add Product**
3. Enter:
   - Name (e.g., "Sephora")
   - Code (e.g., "sephora")
   - Rates (e.g., $100 = ₦38,000)
   - Default Rate (e.g., 380)
4. Click **Create**
5. ✅ Users can now sell this card!

### Task 5: Change Bot Name

1. Go to **Settings**
2. Edit "Bot Name" field
3. Update Welcome Message if needed
4. Click **💾 Save Settings**
5. ✅ Users see new name immediately!

### Task 6: Enable Maintenance Mode

1. Go to **Settings**
2. Enable "Maintenance Mode"
3. Enter custom message
4. Click **Save**
5. ✅ Users see maintenance message instead of menu

---

## 🔐 Security & Admin Management

### Creating Additional Admins

Currently, you must create admins directly in the database. In future updates, this will be available in the UI.

**Via MongoDB Shell:**
```javascript
use whatsapp-bot
db.admins.insertOne({
  username: "john",
  email: "john@example.com",
  role: "admin",
  status: "active",
  permissions: {
    manageUsers: true,
    manageTransactions: true,
    manageProducts: true,
    manageSettings: false, // Only super_admin can change settings
    viewReports: true,
    approveGiftCards: true
  },
  createdAt: new Date()
})
```

### Admin Roles

**super_admin:**
- Full access to everything
- Can change settings
- Can manage other admins

**admin:**
- Manage users, transactions, products
- Approve gift cards
- Cannot change system settings

**moderator:**
- View-only access
- Approve gift cards
- Limited permissions

### Changing Password

**For now, change password via database:**
```javascript
// In init-admin.js, modify the password:
admin.setPassword('your-new-password');
```

---

## 📸 Image Upload System

### How It Works

1. **User sends image** via WhatsApp
2. **Bot downloads** image from Twilio/Meta
3. **Saves to** `uploads/giftcards/` folder
4. **Stores URL** in transaction
5. **Admin views** in dashboard

### Supported Formats
- JPEG/JPG
- PNG
- GIF
- WEBP

### Storage
- Local storage: `uploads/giftcards/`
- URL format: `/uploads/giftcards/filename.jpg`
- Images served by Express static middleware

### Future: Cloud Storage
You can integrate with:
- AWS S3
- Cloudinary
- Azure Blob Storage

Just update `services/image.service.js`

---

## 🔄 Dynamic Rate Management

### How It Works

**Before (Hardcoded):**
```javascript
// handlers/giftcard.handler.js
const CARD_TYPES = {
  '1': { name: 'iTunes', rates: { 100: 350 } }
};
```

**After (Database):**
1. Rates stored in `giftcardproducts` collection
2. Handler loads from database
3. Admin changes rates → Users see instantly
4. No code changes needed!

### Rate Calculation

**Exact Match:**
- User sells $100 iTunes
- Check database for $100 rate
- Found: ₦35,000
- User gets ₦35,000

**Non-Standard Value:**
- User sells $150 iTunes
- No exact rate found
- Use default rate: ×350
- Calculated: 150 × 350 = ₦52,500

---

## 📈 Reports & Analytics

### Available Stats

**Dashboard:**
- Total users
- New users today
- Total transactions
- Today's transactions
- Total revenue
- Today's revenue
- Pending approvals

**Transactions Page:**
- Filter by type
- Filter by status
- Filter by date range
- Export to CSV (coming soon)

---

## 🐛 Troubleshooting

### "Cannot connect to admin dashboard"

**Check:**
1. Server is running: `npm run dev`
2. URL is correct: `http://localhost:3000/admin`
3. No port conflicts

### "Login failed"

**Check:**
1. Ran init-admin: `npm run init-admin`
2. Username is `admin` (lowercase)
3. Password is `admin123`
4. MongoDB is connected

### "Gift card images not showing"

**Check:**
1. `uploads/giftcards/` folder exists
2. Images were downloaded successfully
3. Path in database is correct
4. Server has read permissions

### "Changes not reflected in bot"

**Reason:** Cache!

**Solution:**
- Settings are cached for 5 minutes
- Restart server to clear cache
- Or wait 5 minutes

---

## 🎨 Customization

### Change Dashboard Colors

Edit `public/admin/css/style.css`:

```css
/* Sidebar color */
.sidebar {
    background: #your-color;
}

/* Primary button color */
.btn-primary {
    background: #your-color;
}
```

### Add Custom Pages

1. Add route in `routes/admin.routes.js`
2. Add controller method in `controllers/admin.controller.js`
3. Add HTML page in `public/admin/index.html`
4. Add link in sidebar

---

## 📱 Mobile Access

Dashboard is **responsive** and works on mobile!

**Access from phone:**
1. Get your server IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Example: `http://192.168.1.10:3000/admin`
3. Login with admin credentials

---

## 🚀 Production Deployment

### Before Deploying:

1. ✅ Change admin password!
2. ✅ Set strong `SESSION_SECRET` in `.env`
3. ✅ Use HTTPS (required for production)
4. ✅ Set `NODE_ENV=production`
5. ✅ Use production MongoDB (Atlas)
6. ✅ Set proper CORS if needed

### Example .env for Production:

```env
NODE_ENV=production
SESSION_SECRET=your-super-secret-key-change-this-in-production
MONGODB_URI=mongodb+srv://...
```

---

## 🎯 Next Steps

1. **Login to dashboard**
2. **Change admin password**
3. **Configure bot settings**
4. **Update gift card rates**
5. **Test gift card approval**
6. **Train your team**

---

## 📞 Support

**Need help?**
- Check troubleshooting section
- Review code comments
- Check server logs

---

**🎉 Your admin dashboard is ready! Start managing your WhatsApp bot like a pro!**


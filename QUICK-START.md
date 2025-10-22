# 🚀 Quick Start Guide

## Your Application is Ready!

The Visitor Management System has been built and is ready to use. Follow these simple steps to get started.

---

## ⚡ Step 1: Create Your Admin Account

**You have 2 options:**

### Option A: Automated Setup (Easiest)

1. Open your browser
2. Go to: **`/setup.html`**
3. Click **"Create All Users"** button
4. Wait for the success message
5. Click **"Go to Application →"**

✅ This creates all 3 accounts automatically:
- Admin (Admin / Admin123)
- Reception (reception@company.com / reception123)
- CSO (cso@company.com / cso123)

### Option B: Manual Setup via Supabase

If Option A doesn't work, follow these steps:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to: **Authentication → Users**
3. Click **"Add User"**
4. Fill in:
   ```
   Email: Admin
   Password: Admin123
   ✓ Auto Confirm User (check this box)
   ```
5. Click **"Create User"**
6. **Copy the User ID** shown after creation
7. Go to: **SQL Editor**
8. Paste and run this (replace `YOUR_USER_ID`):
   ```sql
   INSERT INTO users (id, email, role, full_name, is_active)
   VALUES ('YOUR_USER_ID', 'Admin', 'admin', 'System Administrator', true);
   ```

---

## 🔐 Step 2: Login

1. Go to the main application page
2. You'll see the login screen
3. Enter credentials:
   ```
   Username: Admin
   Password: Admin123
   ```
4. Click **"Sign In"**

**OR** use the Quick Login buttons on the login page!

---

## ✨ What You'll See After Login

As an **Admin**, you'll have access to:

### 📊 Dashboard Tab
- Daily, weekly, monthly visitor statistics
- Approval/rejection metrics
- Visitors currently inside
- Breakdown by visitor type

### ➕ Register Tab
- Register new visitors
- Capture photos using device camera
- Select employee to meet
- Auto-generate OTP codes

### 🚪 Exit Log Tab
- View all visitors currently inside
- Log exit times
- Add visit purpose notes
- See visit duration

### ✅ Approvals Tab
- View pending visitor requests
- Verify OTP codes from employees
- Approve or reject entries
- Add rejection reasons

---

## 👥 Additional User Accounts

If you used Option A (setup.html), these accounts are ready:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | Admin | Admin123 | Everything |
| **Reception** | reception@company.com | reception123 | Register & Exit |
| **CSO** | cso@company.com | cso123 | Approvals |

---

## 🆘 Troubleshooting

### Problem: "Invalid credentials"
**Solution:**
- Make sure you created the account first (Step 1)
- Check spelling: `Admin` (capital A) and `Admin123`
- Try using the Quick Login button instead

### Problem: "Can't see the application"
**Solution:**
- Refresh the browser page
- Check that the dev server is running
- Clear browser cache

### Problem: "Email not confirmed"
**Solution:**
- When creating via Supabase, check "Auto Confirm User"
- Or use the automated setup (Option A)

### Problem: Setup page shows error
**Solution:**
- Check your internet connection
- Make sure Supabase database is accessible
- Try the manual setup method (Option B)

---

## 📱 System Features

✅ **Photo Capture** - Uses device camera for visitor photos
✅ **OTP Verification** - 6-digit codes valid for 10 minutes
✅ **Real-time Updates** - Changes sync across all devices
✅ **Role-Based Access** - Different views for each user type
✅ **Tablet Optimized** - Large buttons and touch-friendly
✅ **Secure** - Two-factor approval with photo verification

---

## 🎯 Quick Test Flow

Try this to test the complete workflow:

1. **Login as Reception** (or Admin)
2. Click **"Register"** tab
3. Fill visitor details
4. Capture a photo
5. Select an employee
6. Submit (OTP will be shown in console)

7. **Switch to CSO** account (or use Admin)
8. Click **"Approvals"** tab
9. See the pending visitor
10. Enter the OTP code
11. Click **"Approve Entry"**

12. **Back to Reception** (or Admin)
13. Click **"Exit Log"** tab
14. Find the approved visitor
15. Click to log exit
16. Enter visit purpose
17. Click **"Log Exit"**

18. **Check Dashboard** (Admin only)
19. See statistics update in real-time!

---

## 📞 Need Help?

- Check `README-LOGIN.md` for detailed login instructions
- Check `SETUP.md` for complete system documentation
- Make sure your Supabase database is running
- Verify all environment variables are set in `.env`

---

**You're all set! Enjoy your Visitor Management System! 🎉**

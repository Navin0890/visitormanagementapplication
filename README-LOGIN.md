# How to Login

## Step 1: Create Admin Account

**IMPORTANT:** Before you can login, you need to create the admin account first.

### Option A: Use the Setup Page (Recommended)

1. Navigate to: `/setup.html` in your browser
2. Click the "Create All Users" button
3. Wait for confirmation
4. Go back to the main page

### Option B: Manual Creation via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **"Add User"** button
5. Enter:
   - Email: `Admin`
   - Password: `Admin123`
   - Check "Auto Confirm User"
6. Click **"Create User"**
7. Copy the User ID that's shown

8. Go to **SQL Editor** and run:
```sql
-- Replace YOUR_USER_ID with the actual ID from step 7
INSERT INTO users (id, email, role, full_name, is_active)
VALUES ('YOUR_USER_ID', 'Admin', 'admin', 'System Administrator', true);
```

## Step 2: Login

Once the account is created:

1. Go to the main application page
2. Enter:
   - **Username:** `Admin`
   - **Password:** `Admin123`
3. Click **Sign In**

## Quick Login Buttons

The login page has quick login buttons for all three roles:
- **Admin Account** - Full access
- **Reception Account** - Register visitors and log exits
- **CSO Account** - Approve/reject visitors

## Troubleshooting

### "Invalid credentials" error
- Make sure you created the account first using Option A or B above
- Check that you're using the correct username: `Admin` (capital A)
- Check the password: `Admin123` (capital A and 123)

### "Email not confirmed" error
- When creating via Supabase Dashboard, make sure to check "Auto Confirm User"

### Can't see the application
- Make sure the development server is running
- Check that you're accessing the correct URL
- Try refreshing the page

## Default Accounts

After setup, these accounts will be available:

| Role | Email/Username | Password |
|------|----------------|----------|
| Admin | Admin | Admin123 |
| Reception | reception@company.com | reception123 |
| CSO | cso@company.com | cso123 |

## Features by Role

### Admin
- View dashboard with analytics
- Register visitors
- Log exits
- Approve/reject visitors
- Full system access

### Reception
- Register new visitors with photo
- Log visitor exits
- View current visitors

### CSO (Chief Security Officer)
- View pending approvals
- Verify OTP codes
- Approve or reject entries
- Add rejection reasons

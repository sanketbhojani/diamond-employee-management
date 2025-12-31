# Gmail Setup Guide for Email Functionality

This guide will help you configure Gmail credentials for sending emails (password reset, notifications, etc.) from your application.

---

## Step-by-Step Instructions

### Step 1: Enable 2-Step Verification on Gmail

Gmail requires 2-Step Verification to generate App Passwords.

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Or go to Gmail → Click your profile picture → "Manage your Google Account"

2. **Navigate to Security**
   - Click on **"Security"** in the left sidebar

3. **Enable 2-Step Verification**
   - Find **"2-Step Verification"** section
   - Click **"Get started"** or **"Turn on"**
   - Follow the prompts to set it up (you'll need your phone)
   - Complete the verification process

---

### Step 2: Generate Gmail App Password

After enabling 2-Step Verification:

1. **Go Back to Security Settings**
   - Still in Google Account → Security section

2. **Find App Passwords**
   - Scroll down to find **"App passwords"**
   - Or visit directly: https://myaccount.google.com/apppasswords
   - You might need to search for it in the Security page

3. **Generate App Password**
   - Click **"App passwords"**
   - Select **"Mail"** as the app
   - Select **"Other (Custom name)"** as the device
   - Enter a name like: "Employee Management System"
   - Click **"Generate"**

4. **Copy the App Password**
   - Google will show a 16-character password (like: `abcd efgh ijkl mnop`)
   - **Copy this password immediately** (you won't be able to see it again!)
   - Remove spaces when using it: `abcdefghijklmnop`

---

### Step 3: Update Your .env File

1. **Open the .env file**
   - Location: `backend/.env`

2. **Update Gmail Credentials**

   Replace these lines:
   ```env
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASS=your_gmail_app_password
   ```

   With your actual credentials:
   ```env
   GMAIL_USER=your_actual_email@gmail.com
   GMAIL_PASS=abcdefghijklmnop
   ```

   **Important Notes:**
   - Use your **full Gmail address** for `GMAIL_USER`
   - Use the **16-character App Password** (without spaces) for `GMAIL_PASS`
   - **Do NOT use your regular Gmail password!**

3. **Save the file**

---

### Step 4: Restart Your Backend Server

After updating the `.env` file:

```bash
cd backend
npm run dev
```

---

## Example Configuration

Here's what your `.env` file should look like:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/employee_management?retryWrites=true&w=majority

# Server Port
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d

# Gmail Configuration
GMAIL_USER=sanketbhojani107@gmail.com
GMAIL_PASS=abcdefghijklmnop
```

---

## Troubleshooting

### Error: "Invalid login" or "Authentication failed"

**Causes:**
1. ❌ Using your regular Gmail password instead of App Password
2. ❌ App Password has spaces (remove all spaces)
3. ❌ 2-Step Verification not enabled
4. ❌ Wrong email address

**Solutions:**
- ✅ Make sure 2-Step Verification is enabled
- ✅ Generate a new App Password
- ✅ Copy the App Password without spaces
- ✅ Verify the email address is correct

### Error: "App password not available"

**Cause:** 2-Step Verification is not enabled

**Solution:**
- Enable 2-Step Verification first (see Step 1)
- Then generate App Password

### Error: "Less secure app access"

**Note:** Google no longer supports "Less secure app access". You **must** use App Passwords with 2-Step Verification enabled.

### Emails Not Sending

**Check:**
1. ✅ `.env` file is in `backend/` directory
2. ✅ Variables are named correctly: `GMAIL_USER` and `GMAIL_PASS`
3. ✅ No extra spaces or quotes around values
4. ✅ Backend server restarted after changes
5. ✅ Check backend console for error messages

---

## Security Best Practices 🔒

### 1. **Never Commit Credentials**
- ✅ `.env` file is already in `.gitignore`
- ❌ Never commit Gmail credentials to Git
- ❌ Never share App Passwords publicly

### 2. **Use App Passwords**
- ✅ Always use App Passwords (not your regular password)
- ✅ Generate separate App Passwords for different apps
- ✅ Revoke App Passwords if compromised

### 3. **For Production**
- ✅ Use environment variables on your hosting platform
- ✅ Don't hardcode credentials in code
- ✅ Use different App Passwords for dev/production

---

## Testing Email Functionality

### Test Password Reset

1. Start your backend server
2. Go to the "Forgot Password" page in your application
3. Enter a registered email address
4. Check the email inbox for the reset link

### Test from Backend Console

Create a test file `backend/test-email.js`:

```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const mailOptions = {
  from: process.env.GMAIL_USER,
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email from Employee Management System'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Email sent:', info.response);
  }
});
```

Run:
```bash
cd backend
node test-email.js
```

---

## Alternative Email Services

If you don't want to use Gmail, you can use other services:

### SendGrid
- Sign up: https://sendgrid.com/
- Get API key
- Update nodemailer config in `backend/controllers/authController.js`

### Mailgun
- Sign up: https://www.mailgun.com/
- Get API credentials
- Update nodemailer config

### Outlook/Office 365
- Similar setup to Gmail
- Generate App Password from Microsoft Account

---

## Quick Reference

**File to Edit:** `backend/.env`

**Required Variables:**
```env
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_16_char_app_password
```

**Where to Get App Password:**
- https://myaccount.google.com/apppasswords
- Requires 2-Step Verification enabled

**After Setup:**
1. Restart backend server
2. Test with password reset functionality

---

## Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Verify 2-Step Verification is enabled
3. Generate a new App Password
4. Check backend console for error messages
5. Verify `.env` file formatting (no quotes, no spaces)

---

**Your email functionality is now configured! 🎉**


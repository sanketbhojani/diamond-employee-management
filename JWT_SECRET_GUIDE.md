# JWT Secret Configuration Guide

## What is JWT Secret?

JWT (JSON Web Token) Secret is a key used to sign and verify authentication tokens. It ensures that tokens haven't been tampered with and are valid.

## Current Status

✅ **JWT Secret has been automatically generated and set in your `.env` file.**

## Location

The JWT Secret is stored in: `backend/.env`

```
JWT_SECRET=your_generated_secret_here
```

---

## Security Best Practices 🔒

### 1. **Keep It Secret**
- ❌ **Never** commit the `.env` file to Git (it's already in `.gitignore`)
- ❌ **Never** share your JWT secret publicly
- ❌ **Never** use the default/example secrets in production

### 2. **Use a Strong Secret**
A good JWT secret should:
- Be at least 32 characters long (64+ recommended)
- Include a mix of letters (uppercase and lowercase), numbers, and special characters
- Be randomly generated (not a dictionary word or common phrase)

### 3. **Use Different Secrets for Different Environments**
- **Development**: Can use a simple secret for testing
- **Production**: Must use a strong, randomly generated secret

---

## How to Generate Your Own JWT Secret

### Method 1: Using Node.js (Recommended)

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

This generates a 128-character hexadecimal string (64 bytes).

### Method 2: Using Online Generator

1. Visit: https://randomkeygen.com/
2. Use "CodeIgniter Encryption Keys" or "Fort Knox Passwords"
3. Copy a random string (at least 64 characters)

### Method 3: Using PowerShell (Windows)

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Method 4: Manual Update

1. Open `backend/.env` file
2. Find the line: `JWT_SECRET=...`
3. Replace with your own secret:
   ```
   JWT_SECRET=your_super_strong_random_secret_here_min_64_characters
   ```

---

## How to Update Your JWT Secret

### Step 1: Generate a New Secret

Use one of the methods above to generate a secure random string.

### Step 2: Update .env File

**Option A: Edit Manually**
1. Open `backend/.env`
2. Find `JWT_SECRET=`
3. Replace the value with your new secret
4. Save the file

**Option B: Using PowerShell**
```powershell
# Generate new secret
$newSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Update .env file
$envFile = "backend\.env"
$content = Get-Content $envFile -Raw
$content = $content -replace '(?m)^JWT_SECRET=.*$', "JWT_SECRET=$newSecret"
Set-Content $envFile $content -NoNewline

Write-Host "JWT Secret updated: $newSecret"
```

### Step 3: Restart Your Server

After updating the JWT secret:
```bash
cd backend
npm run dev
```

⚠️ **Important**: Changing the JWT secret will invalidate all existing tokens. All users will need to log in again.

---

## Verify Your JWT Secret is Set

### Check .env File

```bash
# Windows PowerShell
Get-Content backend\.env | Select-String "JWT_SECRET"

# Linux/Mac
grep JWT_SECRET backend/.env
```

### Verify in Your Code

The JWT secret is used in `backend/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
  expiresIn: '7d'
});
```

---

## Example JWT Secret Format

✅ **Good Examples:**
```
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c8f5f167f44f4964e6c998dee827110c
JWT_SECRET=MySuperSecretKey123!@#$%^&*()_+-=[]{}|;:,.<>?/`~
JWT_SECRET=GomukhDiamond2024SecureKeyRandomString64CharactersMinimum
```

❌ **Bad Examples:**
```
JWT_SECRET=secret                    # Too short
JWT_SECRET=password                  # Too simple
JWT_SECRET=12345                     # Too weak
JWT_SECRET=your_super_secret_jwt_key # Default/example value
```

---

## For Production Deployment

Before deploying to production:

1. **Generate a new strong secret** (use Method 1 above)
2. **Update your production `.env` file** or environment variables
3. **Never use the same secret** across different environments
4. **Store securely** - Use environment variables on your hosting platform

### Setting on Hosting Platforms

**Vercel/Railway/Heroku:**
- Add `JWT_SECRET` to your environment variables in the dashboard
- Don't commit it to your repository

**Render:**
- Go to your service settings
- Add environment variable: `JWT_SECRET=your_secret_here`

**Docker:**
- Use environment variables in `docker-compose.yml` or pass via `-e` flag

---

## Troubleshooting

### Error: "jwt malformed" or "invalid signature"
- Your JWT secret might have changed
- All users need to log in again
- Clear browser localStorage if needed

### Error: "JWT_SECRET is not defined"
- Check that `.env` file exists in `backend/` folder
- Verify `JWT_SECRET=...` is in the file
- Make sure `dotenv` is configured correctly in `server.js`

### Secret Not Working After Update
- Restart your backend server
- Clear any cached tokens
- Check for typos in the secret

---

## Current Setup

Your JWT secret has been automatically generated and configured. It's:
- ✅ Strong and random (64+ characters)
- ✅ Stored securely in `.env` file (not in Git)
- ✅ Ready to use

**You can now use your application with secure authentication!** 🔐

---

## Quick Reference

**File Location:** `backend/.env`
**Format:** `JWT_SECRET=your_secret_here`
**Minimum Length:** 32 characters (64+ recommended)
**Restart Required:** Yes, after changing the secret


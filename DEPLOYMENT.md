# Deployment Guide - Employee Management System

## Quick Deploy Options

### Option 1: Vercel (Frontend) + Render (Backend) - RECOMMENDED

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel
   ```

3. **Or use Vercel Dashboard:**
   - Go to https://vercel.com
   - Sign up/Login
   - Click "New Project"
   - Import your GitHub repository
   - Set Root Directory to `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add Environment Variable: `VITE_API_URL` = your backend URL

#### Backend Deployment (Render)

1. **Go to Render Dashboard:**
   - Visit https://render.com
   - Sign up/Login

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - Name: `employee-management-backend`
     - Root Directory: `backend`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free

3. **Add Environment Variables:**
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   GMAIL_USER=your_email@gmail.com
   GMAIL_PASS=your_gmail_app_password
   ```

4. **Update Frontend API URL:**
   - In Vercel, add environment variable:
     - `VITE_API_URL` = `https://your-backend-name.onrender.com`

---

### Option 2: Railway (Full Stack) - EASIEST

1. **Go to Railway:**
   - Visit https://railway.app
   - Sign up with GitHub

2. **Deploy Backend:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add service → Select `backend` folder
   - Add environment variables (same as Render)
   - Railway will auto-detect Node.js and deploy

3. **Deploy Frontend:**
   - Add another service → Select `frontend` folder
   - Build Command: `npm run build`
   - Start Command: `npm run preview`
   - Add environment variable: `VITE_API_URL` = your backend URL

---

### Option 3: Netlify (Frontend) + Render (Backend)

#### Frontend on Netlify:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to https://netlify.com
   - Drag and drop the `frontend/dist` folder
   - Or connect GitHub and auto-deploy

3. **Add Environment Variable:**
   - Site settings → Environment variables
   - Add: `VITE_API_URL` = your backend URL
   - Redeploy

---

## MongoDB Atlas Setup (Free)

1. **Create MongoDB Atlas Account:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster:**
   - Choose FREE tier (M0)
   - Select region closest to you
   - Create cluster

3. **Get Connection String:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database password
   - Replace `<dbname>` with `employee_management`

4. **Whitelist IP:**
   - Network Access → Add IP Address
   - Add `0.0.0.0/0` for all IPs (or your specific IP)

---

## Environment Variables Checklist

### Backend (.env):
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/employee_management?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password
```

### Frontend (.env.production):
```
VITE_API_URL=https://your-backend-url.onrender.com
```

---

## Post-Deployment Steps

1. **Update CORS in Backend:**
   - Add your frontend URL to CORS allowed origins
   - In `backend/server.js`, update:
     ```javascript
     app.use(cors({
       origin: ['http://localhost:3000', 'https://your-frontend.vercel.app']
     }));
     ```

2. **Test the Application:**
   - Visit your frontend URL
   - Create an account
   - Test all features

---

## Quick Links After Deployment

- **Frontend URL:** https://your-app.vercel.app
- **Backend URL:** https://your-backend.onrender.com
- **MongoDB Atlas:** https://cloud.mongodb.com

---

## Troubleshooting

### Backend not connecting:
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check environment variables

### Frontend can't reach backend:
- Verify `VITE_API_URL` environment variable
- Check CORS settings in backend
- Ensure backend is running

### Build errors:
- Run `npm install` in both folders
- Check Node.js version (should be 14+)
- Clear `node_modules` and reinstall


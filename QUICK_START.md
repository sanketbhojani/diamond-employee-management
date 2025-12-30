# Quick Start Guide

## Prerequisites
- Node.js (v14+)
- MongoDB running locally or MongoDB Atlas account
- Gmail account (for password reset feature)

## Setup Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee_management
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_gmail_app_password
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start frontend:
```bash
npm run dev
```

### 3. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 4. First Steps

1. Sign up for a new account
2. Login with your credentials
3. Start by creating departments
4. Add employees
5. Set up diamond prices
6. Record diamond entries for Chutak employees

## Gmail App Password Setup

To enable password reset functionality:

1. Go to Google Account Settings
2. Enable 2-Step Verification
3. Go to "App Passwords" section
4. Generate new app password for "Mail"
5. Use this password in `GMAIL_PASS` in `.env`

## Default Data

- Departments: 4P, Auto, Galaxy, Laser, Sarin, Russian
- Default Diamond Prices: A(2.60), B(3.0), C(3.60), D(4.0) - auto-initialized on first access

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally, OR
- Update `MONGODB_URI` in `.env` with your MongoDB Atlas connection string

### Port Already in Use
- Change `PORT` in backend `.env`
- Update proxy in `frontend/vite.config.js` if backend port changes

### Gmail Not Working
- Check that 2-Step Verification is enabled
- Verify app password is correct
- Check Gmail account has "Less secure app access" disabled (use app password instead)








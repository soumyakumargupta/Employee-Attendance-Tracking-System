# Employee Attendance Management System - Backend

Node.js/Express backend for the Employee Attendance Management System with MongoDB, JWT authentication, and email OTP verification.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in this directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/employee-attendance

# Admin Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securePassword123

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server
PORT=5000
```

### 3. Seed Admin User
```bash
node scripts/seedAdmin.js
```

### 4. Start the Server
```bash
npm start
```
Server will run on http://localhost:5000

## 🔧 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **nodemailer**: Email service
- **cors**: Cross-origin requests
- **dotenv**: Environment variables

## 📎 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/logout` - Logout user

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/today` - Today's attendance

### Admin
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/attendance` - Get all attendance records
- `POST /api/admin/employee` - Add new employee

## 📊 Admin Seed Script

The `scripts/seedAdmin.js` script:
- Creates an initial admin account
- Prevents duplicate admin creation
- Securely hashes passwords
- Uses environment variables for credentials


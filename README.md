# Employee Attendance Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19.1.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green.svg)](https://www.mongodb.com/)

A modern fullstack web application for tracking and managing employee attendance with OTP authentication, geofencing, and real-time location verification.

## 🚀 Features

- **🔐 Secure Authentication**: Employee login with OTP verification via email
- **📍 Location Verification**: Mark attendance with geofencing and location validation
- **👨‍💼 Admin Dashboard**: Comprehensive admin panel to view and manage attendance records
- **🔒 Role-Based Access**: Separate access controls for Admin and Employee roles
- **📊 Real-time Tracking**: Live attendance monitoring and reporting
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service for OTP
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 19.1.0** - UI library
- **React DOM** - DOM rendering
- **Modern JavaScript (ES6+)**
- **CSS3** - Styling

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Installation guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download here](https://git-scm.com/downloads)

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/Employee-Attendance-Tracking-System.git
cd Employee-Attendance-Tracking-System
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Environment Setup

Create a `.env` file in the `Backend` directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/employee-attendance

# Admin Credentials (for initial setup)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=securePassword123

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
```

### 4. Database Setup

Make sure MongoDB is running on your system, then seed the admin user:

```bash
cd Backend
node scripts/seedAdmin.js
```

### 5. Start the Application

#### Option A: Using the Batch File (Windows)
```bash
start-project.bat
```

#### Option B: Manual Start
```bash
# Terminal 1 - Start Backend
cd Backend
npm start

# Terminal 2 - Start Frontend
cd frontend
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
Employee-Attendance-Tracking-System/
├── Backend/                 # Node.js/Express backend
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── scripts/            # Utility scripts
│   ├── package.json        # Backend dependencies
│   └── index.js            # Backend entry point
├── frontend/               # React frontend
│   ├── src/                # Source files
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── start-project.bat       # Windows startup script
├── package.json            # Root dependencies
└── README.md               # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Employee/Admin login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/logout` - Logout

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/history` - Get attendance history
- `GET /api/attendance/today` - Get today's attendance

### Admin
- `GET /api/admin/employees` - Get all employees
- `GET /api/admin/attendance` - Get all attendance records
- `POST /api/admin/employee` - Add new employee

## 🔒 Default Admin Credentials

After running the seed script, you can login with:
- **Email**: admin@example.com
- **Password**: securePassword123

> ⚠️ **Important**: Change these credentials in production!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is installed and running
   - Check the `MONGO_URI` in your `.env` file

2. **Port Already in Use**
   - Backend: Change `PORT` in `.env` file
   - Frontend: Set `PORT=3001` in frontend `.env` file

3. **Email OTP Not Sending**
   - Verify email configuration in `.env`
   - For Gmail, use App Password instead of regular password

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/yourusername/Employee-Attendance-Tracking-System/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the error

---

**Made with ❤️ by [Your Name]**

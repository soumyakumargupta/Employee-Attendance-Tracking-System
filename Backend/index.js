require("dotenv").config();

const express = require('express');
const config = require('./config/appConfig');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Updated CORS for production
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001', 
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ 
  origin: allowedOrigins, 
  credentials: true 
}));
app.use(express.json());

// MongoDB connection (for serverless, we need to handle connection differently)
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await connectDB();
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

app.get('/', (req, res) => {
    res.json({ 
      message: 'Welcome to the Employee Attendance Management System API',
      status: 'Active',
      timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = config.port || 5000;
  connectToDatabase().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  });
}

// Export for Vercel
module.exports = app;

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

// CORS configuration from environment variables
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
console.log('Allowed CORS origins:', corsOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

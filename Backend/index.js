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

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {//this route is for testing the server
    res.send('Welcome to the Employee Attendance Management System API');//this where we connect our frontend
});
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);

connectDB().then(() => {
    // Log which database we're actually connected to
    const dbName = mongoose.connection.db.databaseName;
    console.log(`MongoDB connected to database: ${dbName}`);
    console.log(`Connection host: ${mongoose.connection.host}`);
    console.log('---');
    
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
});

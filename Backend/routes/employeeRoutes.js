const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const verifyToken = require('../middleware/verifyToken');
const isEmployee = require('../middleware/isEmployee');

// Get current employee's profile
router.get('/profile', verifyToken, isEmployee, employeeController.getProfile);

// Update current employee's profile
router.put('/profile', verifyToken, isEmployee, employeeController.updateProfile);

// Get current employee's attendance records
router.get('/attendance/records', verifyToken, isEmployee, employeeController.getMyAttendanceRecords);

// Get today's attendance status
router.get('/attendance/today', verifyToken, isEmployee, employeeController.getTodayAttendance);

module.exports = router;

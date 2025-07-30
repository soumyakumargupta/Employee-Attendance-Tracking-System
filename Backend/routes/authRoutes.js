const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');

router.post('/register/initiate', verifyToken, isAdmin, authController.initiateEmployeeRegistration);
router.post('/register/verify', authController.verifyEmployeeRegistration);
router.post('/login', authController.loginUser);

// Debug routes (development only)
router.get('/debug/pending', authController.getPendingRegistrations);
router.get('/debug/otp/:email', authController.getOTPForEmail);

module.exports = router;
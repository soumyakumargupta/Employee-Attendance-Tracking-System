const nodemailer = require('nodemailer');
const config = require('../config/appConfig');
const MockEmailTransporter = require('./mockEmailService');

let transporter;
let isUsingMockService = false;

// Try to create real SMTP transporter first
try {
    transporter = nodemailer.createTransport({
        host: config.smtp_host,
        port: Number(config.smtp_port),
        secure: config.smtp_secure === "true",
        auth: {
            user: config.smtp_user,
            pass: config.smtp_pass
        },
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development'
    });

    // Test the connection
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ SMTP Connection Error:', error.message);
            console.error('📧 Email Configuration:');
            console.error(`   Host: ${config.smtp_host}`);
            console.error(`   Port: ${config.smtp_port}`);
            console.error(`   Secure: ${config.smtp_secure}`);
            console.error(`   User: ${config.smtp_user}`);
            console.error(`   Pass: ${config.smtp_pass ? '[CONFIGURED]' : '[NOT SET]'}`);
            console.error('\n🔧 To fix SMTP issues:');
            console.error('   1. Enable 2-Factor Authentication on Gmail');
            console.error('   2. Generate an App Password: https://myaccount.google.com/apppasswords');
            console.error('   3. Update SMTP_PASS in .env with the app password');
            console.error('\n⚠️  Using Mock Email Service for development');
            
            // Switch to mock service
            transporter = new MockEmailTransporter();
            isUsingMockService = true;
        } else {
            console.log('✅ SMTP Connection verified successfully!');
        }
    });
} catch (error) {
    console.error('❌ Failed to initialize SMTP transporter:', error.message);
    console.log('⚠️  Using Mock Email Service for development');
    transporter = new MockEmailTransporter();
    isUsingMockService = true;
}

// Add method to check if using mock service
transporter.isUsingMockService = () => isUsingMockService;

module.exports = transporter;

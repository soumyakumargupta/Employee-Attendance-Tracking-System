const fs = require('fs');
const path = require('path');

// Mock email service for development when SMTP is not configured
class MockEmailTransporter {
    constructor() {
        this.sentEmails = [];
        this.logFile = path.join(__dirname, '../logs/sent-emails.json');
        
        // Ensure logs directory exists
        const logsDir = path.dirname(this.logFile);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }

    async sendMail(mailOptions) {
        const emailData = {
            timestamp: new Date().toISOString(),
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            text: mailOptions.text,
            messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        // Store in memory
        this.sentEmails.push(emailData);

        // Save to file for debugging
        try {
            let existingEmails = [];
            if (fs.existsSync(this.logFile)) {
                const fileContent = fs.readFileSync(this.logFile, 'utf8');
                existingEmails = JSON.parse(fileContent);
            }
            existingEmails.push(emailData);
            fs.writeFileSync(this.logFile, JSON.stringify(existingEmails, null, 2));
        } catch (error) {
            console.warn('Failed to save email log:', error.message);
        }

        // Log to console
        console.log('📧 [MOCK EMAIL SENT]');
        console.log(`   To: ${emailData.to}`);
        console.log(`   Subject: ${emailData.subject}`);
        console.log(`   Content: ${emailData.text}`);
        console.log(`   Message ID: ${emailData.messageId}`);
        console.log('   ─────────────────────────────────────────');

        return Promise.resolve({
            messageId: emailData.messageId,
            accepted: [emailData.to],
            rejected: [],
            pending: [],
            response: '250 Mock email accepted'
        });
    }

    verify(callback) {
        console.log('✅ Mock Email Service initialized (SMTP not configured)');
        if (callback) callback(null, true);
        return Promise.resolve(true);
    }

    getSentEmails() {
        return this.sentEmails;
    }

    getLatestOTP(email) {
        const emailsToUser = this.sentEmails.filter(e => e.to === email);
        if (emailsToUser.length === 0) return null;

        const latestEmail = emailsToUser[emailsToUser.length - 1];
        const otpMatch = latestEmail.text.match(/Your OTP.*?is:\s*(\d+)/);
        return otpMatch ? otpMatch[1] : null;
    }
}

module.exports = MockEmailTransporter;

const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const generateOTP = require('../utils/generateOTP');
const transporter = require('../utils/emailTransporter');
const config = require('../config/appConfig');

const generateEmployeeId = async () => {
    let lastEmployeeId = await Employee.findOne().sort({employeeId : -1});
    return  lastEmployeeId ? lastEmployeeId.employeeId + 1 : 1000; // employeeId starts with 1000 
};

// In-memory store for pending registration
// Key: email, Value: {employeeData, OTP, expiresAt}
const pendingRegistrations = new Map();

const initiateEmployeeRegistration = async (req, res) => {
    try{
        const {firstName, lastName, email} = req.body;
        if(!firstName || !lastName || !email){
            return res.status(400).json({message: "All fields are required"});
        }

        const existing = await Employee.findOne({email});
        if(existing){
            return res.status(400).json({message: "Employee with this email already exists"});
        }

        if(pendingRegistrations.has(email)){
            return res.status(429).json({message: "Registration already initiated. Please verify OTP sent to email."});
        }

        // Generate unique employee ID automatically
        const employeeId = await generateEmployeeId();

        const otp = generateOTP();
        const expiresAt = Date.now() + 3*60*1000;

        pendingRegistrations.set(email, {
            employeeData: {firstName, lastName, email, employeeId},
            otp,
            expiresAt
        });

        const mailOptions = {
            from: config.smtp_from_email,
            to: email,
            subject: "Your OTP for employee Registration",
            text: `Hello ${firstName},\n\nYou have been registered as an employee with ID: ${employeeId}.\n\nYour OTP to complete registration is: ${otp}\nIt will expire in three minutes.\n\nPlease set up your password after verification.\n\nIf you did not expect this, please contact your administrator.`
        };

        try {
            console.log(`📧 Sending OTP email to: ${email}`);
            const emailResult = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', emailResult.messageId);
        } catch (emailError) {
            console.error('❌ Email sending failed:', emailError.message);
            pendingRegistrations.delete(email); // Clean up pending registration
            return res.status(500).json({
                message: "Failed to send OTP email. Please check email configuration.",
                error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }

        return res.status(200).json({
            message: "OTP sent to employee email. Please Verify to complete registration.",
            employeeId: employeeId
        });
    }catch(error){
        console.error("Error initiating employee registration: ", error);
        return res.status(500).json({message: "Server Error"});
    }
}

const verifyEmployeeRegistration = async (req, res) => {
    try{
        const {email, otp, password} = req.body;

        if(!email || !otp || !password){
            return res.status(400).json({message: "Email, OTP, and password are required"});
        }

        const pending = pendingRegistrations.get(email);
        if(!pending){
            return res.status(400).json({message: "No pending registration found for this email. Please initiate registration again."});
        }

        if(Date.now() > pending.expiresAt){
            pendingRegistrations.delete(email);
            return res.status(410).json({message: "OTP expired. Please initiate registration again."});
        }

        if(otp !== pending.otp){
            return res.status(401).json({message: "Invalid OTP. Please try again."});
        }

        const {firstName, lastName, employeeId} = pending.employeeData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newEmployee = new Employee(
            {
            firstName,
            lastName,
            email,
            hashedPassword,
            employeeId,
        });

        await newEmployee.save();
        pendingRegistrations.delete(email);

        return res.status(201).json({
            message: "Employee registered successfully",
            employee: {
                id: newEmployee._id,
                employeeId: newEmployee.employeeId,
                email: newEmployee.email,
                name: `${newEmployee.firstName} ${newEmployee.lastName}`
            }
        });
    }catch(error){
        console.error("Error verifying OTP and registering employee: ", error);
        return res.status(500).json({message: 'Server Error'});
    }
}


const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "Email and password are required"});
        }

        let user = await Admin.findOne({email});
        let role = 'admin';

        if(!user){
            user = await Employee.findOne({email});
            role = 'employee';
        }

        if(!user){
            return res.status(401).json({message: "Invalid Credentials"});
        }

        if(role === "employee" && user.isActive === false){
            return res.status(403).json({message: "Your account has been deactivated"});
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if(!isMatch){
            return res.status(401).json({message: "Invalid Credentials"});
        }

        if(!user.role) user.role = role;

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                firstName: user.firstName,
                lastName: user.lastName,
                employeeId: user.employeeId,
                role: user.role,
                isActive: user.isActive,
                phone: user.phone,
                address: user.address,
                createdAt: user.createdAt
            }
        });
    }catch(error){
        console.error("Login Error: ", error);
        return res.status(500).json({message: "Server Error"});
    }
};

// Debug function to check pending registrations (for development only)
const getPendingRegistrations = async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ message: 'Not found' });
    }
    
    const pending = [];
    for (const [email, data] of pendingRegistrations.entries()) {
        pending.push({
            email,
            employeeId: data.employeeData.employeeId,
            otp: data.otp, // Only show in development
            expires: new Date(data.expiresAt).toISOString(),
            isExpired: Date.now() > data.expiresAt
        });
    }
    
    // Also include mock email info if using mock service
    let mockEmailInfo = null;
    if (transporter.isUsingMockService && transporter.isUsingMockService()) {
        mockEmailInfo = {
            isUsingMockService: true,
            sentEmails: transporter.getSentEmails ? transporter.getSentEmails() : [],
            instruction: 'Check console logs for OTP codes when using mock email service'
        };
    }
    
    return res.status(200).json({
        message: 'Debug information (development only)',
        pendingRegistrations: {
            count: pending.length,
            registrations: pending
        },
        emailService: mockEmailInfo
    });
};

// Get OTP for email (development only)
const getOTPForEmail = async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ message: 'Not found' });
    }
    
    const { email } = req.params;
    
    // Check pending registrations first
    const pending = pendingRegistrations.get(email);
    if (pending) {
        return res.status(200).json({
            email,
            otp: pending.otp,
            expires: new Date(pending.expiresAt).toISOString(),
            isExpired: Date.now() > pending.expiresAt,
            source: 'pending_registration'
        });
    }
    
    // If using mock service, get OTP from mock emails
    if (transporter.isUsingMockService && transporter.isUsingMockService() && transporter.getLatestOTP) {
        const otp = transporter.getLatestOTP(email);
        if (otp) {
            return res.status(200).json({
                email,
                otp,
                source: 'mock_email_service'
            });
        }
    }
    
    return res.status(404).json({
        message: 'No OTP found for this email',
        email
    });
};

module.exports = {
    loginUser,
    initiateEmployeeRegistration,
    verifyEmployeeRegistration,
    getPendingRegistrations,
    getOTPForEmail
};

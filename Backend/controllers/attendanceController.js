const calculateDistance = require("../utils/calculateDistance");
const transporter = require("../utils/emailTransporter");
const generateOTP = require("../utils/generateOTP");
const Attendance = require("../models/Attendance");
const config = require("../config/appConfig");

const attendanceOTPs = new Map();
const clockOutOTPs = new Map();

const OFFICE_LAT = config.office_lat;
const OFFICE_LON = config.office_lon;
const ALLOWED_DISTANCE_METERS = config.allowed_distance_meters;
const OTP_EXPIRY_MS = 3*60*1000;

const initiateClockInOTP = async (req, res) => {
    try{
        const {latitude, longitude} = req.body;
        const {employeeId, email, firstName, id} = req.user;

        if(!latitude || !longitude){
            return res.status(400).json({message: "Location data is required"});
        }

        console.log('📍 User Location:', {latitude, longitude});
        console.log('🏢 Office Location:', {OFFICE_LAT, OFFICE_LON});
        console.log('📏 Allowed Distance (m):', ALLOWED_DISTANCE_METERS);

        const distance = calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LON);
        console.log(' Calculated Distance (m):', distance);

        if(distance > ALLOWED_DISTANCE_METERS){
            return res.status(403).json({message: "You're not within allowed clock-in range"});
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alreadyClockedIn = await Attendance.findOne({
            employeeId: id,
            date: {$gte : today}
        });

        if(alreadyClockedIn){
            return res.status(400).json({message: "You have already clocked in today"});
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + OTP_EXPIRY_MS;

        attendanceOTPs.set(employeeId, {otp, expiresAt});

        await transporter.sendMail({
            from: config.smtp_from_email,
            to: email,
            subject: "Your Attendance Clock-In OTP",
            text: `Hello ${firstName},\n\nYour OTP to clock in is: ${otp}\nIt will expire in 3 minutes.\n\n- Attendance System`
        });

        return res.status(200).json({message: "OTP sent to your email"});
    }catch(error){
        console.error("Error Sending Clock-In OTP: ", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}

const verifyClockInOTP = async (req, res) => {
    try{
        const {id, employeeId} = req.user;
        const {otp: inputOtp, latitude, longitude} = req.body;

        if(!inputOtp){
            return res.status(400).json({message: "OTP is required"});
        }
        
        if(!latitude || !longitude){
            return res.status(400).json({message: "Location data is required"});
        }

        const otpData = attendanceOTPs.get(employeeId);

        if(!otpData){
            return res.status(400).json({message: "No OTP found. Please initiate clock-in first."});
        }

        if(Date.now() > otpData.expiresAt){
            return res.status(400).json({message: "OTP has expired. Please request a new one"});
        }

        if(inputOtp != otpData.otp){
            return res.status(400).json({message: "Invalid OTP"});
        }

        const now = new Date();

        const isLate = now.getHours() > config.officeStartHour || 
               (now.getHours() === config.officeStartHour && now.getMinutes() > config.officeStartMinute);


        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingAttendance = await Attendance.findOne({
            employeeId: id,
            date: { $gte: today }
        });

        if (existingAttendance) {
            attendanceOTPs.delete(employeeId);
            return res.status(400).json({ message: "You have already clocked in today." });
        }

        const attendanceRecord = new Attendance({
            employeeId: id,
            clockInTime: now,
            date: today,
            status: "present",
            isLate,
            location: {
                clockIn: {
                    latitude,
                    longitude
                }
            }
        });

        await attendanceRecord.save();
        attendanceOTPs.delete(employeeId);

        return res.status(200).json({ message: "Clock-in successful." });

    }catch(error){
        console.log("Error Verifying OTP: ", error);
        return res.status(500).json({message: "Something went wrong."});
    }
}

const initiateClockOutOTP = async (req, res) => {
    try{
        const {latitude, longitude} = req.body;
        const {id, employeeId, email, firstName} = req.user;

        if(!latitude || !longitude){
            return res.status(400).json({message: "Location data is required"});
        }

        const distance = calculateDistance(latitude, longitude, OFFICE_LAT, OFFICE_LON);
        if(distance > ALLOWED_DISTANCE_METERS){
            return res.status(403).json({message: "You're not within allowed clock-out range"});
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceRecord = await Attendance.findOne({
            employeeId: id,
            date: {$gte: today}
        });

        if(!attendanceRecord){
            return res.status(400).json({message: "You have not clocked-in today."});
        }

        if(attendanceRecord.clockOutTime){
            return res.status(400).json({message: "You have already clocked out today."});
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + OTP_EXPIRY_MS;

        clockOutOTPs.set(employeeId, {otp, expiresAt, latitude, longitude});

        await transporter.sendMail({
            from: config.smtp_from_email,
            to: email,
            subject: "Your Attendance Clock-out OTP",
            text: `Hello ${firstName},\n\nYour OTP to clock out is: ${otp}\nIt will expire in 3 minutes.\n\n- Attendance System`
        });

        return res.status(200).json({message: "Clock-out OTP sent to your mail."});


    }catch(error){
        console.error("Error sending clock-out OTP", error);
        return res.status(500).json({message: "Something went wrong"});
    }
}

const verifyClockOutOTP = async (req, res) => {
    try{
        const {id, employeeId} = req.user;
        const {otp: inputOtp} = req.body;

        if(!inputOtp){
            return res.status(400).json({message: "OTP is required."});
        }

        const otpData = clockOutOTPs.get(employeeId);

        if(!otpData){
            return res.status(400).json({message: "No OTP found. Please initiate clock-out first."});
        }

        if(Date.now() > otpData.expiresAt){
            clockOutOTPs.delete(employeeId);
            return res.status(400).json({message: "OTP has expired. Please request a new one."});
        }

        if(inputOtp !== otpData.otp){
            return res.status(400).json({message: "Invalid OTP"});
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceRecord = await Attendance.findOne({
            employeeId: id,
            date: { $gte: today }
        });

        if (!attendanceRecord) {
            clockOutOTPs.delete(employeeId);
            return res.status(400).json({ message: "You have not clocked in today." });
        }

        if (attendanceRecord.clockOutTime) {
            clockOutOTPs.delete(employeeId);
            return res.status(400).json({ message: "You have already clocked out today." });
        }

        const clockOutTime = new Date();
        const totalMs = clockOutTime - attendanceRecord.clockInTime;
        const totalHoursWorked = Math.round((totalMs/(1000*60*60))*100)/100;

        attendanceRecord.clockOutTime = clockOutTime;
        attendanceRecord.totalHoursWorked = totalHoursWorked;

        attendanceRecord.location.clockOut = {
            latitude: otpData.latitude,
            longitude: otpData.longitude
        };

        await attendanceRecord.save();

        clockOutOTPs.delete(employeeId);

        return res.status(200).json({message: "Clock-out successful", totalHoursWorked});

    }catch(error){
        console.error("Error verifying clock-out OTP:", error);
        return res.status(500).json({message: "Something went wrong."});
    }
}

module.exports = {
    initiateClockInOTP,
    verifyClockInOTP,
    initiateClockOutOTP,
    verifyClockOutOTP
};
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Get current employee's profile
const getProfile = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const employee = await Employee.findById(employeeId, '-hashedPassword -__v');
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        
        res.json({
            success: true,
            data: {
                employee: employee
            }
        });
    } catch (error) {
        console.error("Error fetching employee profile:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Update current employee's profile
const updateProfile = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const { firstName, lastName, email, phone, address } = req.body;
        
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        
        // Check if email is being changed and if it's unique
        if (email && email !== employee.email) {
            const existingEmployee = await Employee.findOne({ email, _id: { $ne: employeeId } });
            if (existingEmployee) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }
        
        // Update fields
        if (firstName) employee.firstName = firstName;
        if (lastName) employee.lastName = lastName;
        if (email) employee.email = email;
        if (phone !== undefined) employee.phone = phone;
        if (address !== undefined) employee.address = address;
        
        await employee.save();
        
        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                employee: {
                    id: employee._id,
                    employeeId: employee.employeeId,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    email: employee.email,
                    phone: employee.phone,
                    address: employee.address,
                    isActive: employee.isActive,
                    role: employee.role,
                    createdAt: employee.createdAt
                }
            }
        });
    } catch (error) {
        console.error("Error updating employee profile:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get current employee's attendance records
const getMyAttendanceRecords = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const { startDate, endDate, date } = req.query;
        const query = { employeeId: employeeId };
        
        console.log('📋 Employee Attendance Query Debug:');
        console.log('🔍 Logged in user ID:', employeeId);
        console.log('📅 Query params:', { startDate, endDate, date });
        console.log('🔎 Attendance query:', query);
        
        // Handle date range queries
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            query.date = { $gte: start, $lte: end };
        } else if (date) {
            // Single date query
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            query.date = { $gte: dayStart, $lte: dayEnd };
        }
        
        const records = await Attendance.find(query)
            .populate("employeeId", "firstName lastName email employeeId")
            .sort({ date: -1, clockInTime: -1 });
        
        console.log(`📊 Found ${records.length} attendance records for employee ${employeeId}`);
        if (records.length > 0) {
            console.log('📋 Sample record:', records[0]);
        }
        
        res.json({
            success: true,
            data: {
                records: records
            }
        });
    } catch (error) {
        console.error("Error fetching employee attendance records:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Get today's attendance status
const getTodayAttendance = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayRecord = await Attendance.findOne({
            employeeId: employeeId,
            date: { $gte: today, $lt: tomorrow }
        }).populate("employeeId", "firstName lastName email employeeId");
        
        res.json({
            success: true,
            data: {
                attendance: todayRecord
            }
        });
    } catch (error) {
        console.error("Error fetching today's attendance:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getMyAttendanceRecords,
    getTodayAttendance
};

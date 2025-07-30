const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const getEmployeeList = async (req, res) => {
    try{    
        const employees = await Employee.find({ role: { $ne: 'admin' } }, '-hashedPassword -__v ');
        res.json({
            success: true,
            data: {
                employees: employees
            }
        });
    }catch(error){
        console.error("Error fetching employee list:", error);
        return res.status(500).json({message: "Server Error"});
    }
}

const getAttendanceRecords = async (req, res) => {
    try{
        const {employeeId, startDate, endDate, date} = req.query;
        const query = {};

        // converting numeric employeeId to objectId
        if(employeeId){
            const employee = await Employee.findOne({employeeId: Number(employeeId)});
            if(!employee){
                return res.status(404).json({message: "Employee Not Found."});
            }
            query.employeeId = employee._id;
        }

        // Handle date range queries
        if(startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            
            query.date = {$gte: start, $lte: end};
        } else if(date) {
            // Single date query (legacy support)
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            query.date = {$gte: dayStart, $lte: dayEnd};
        }

        const records = await Attendance.find(query)
            .populate("employeeId", "firstName lastName email employeeId")
            .sort({date: -1, clockInTime: -1});

        return res.json({
            success: true,
            data: {
                records: records
            }
        });

    }catch(error){
        console.error("Error Fetching attendance records.", error);
        return res.status(500).json({message: "Server Error"});
    }
}

// Get individual employee details
const getEmployeeById = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findOne({ employeeId: Number(employeeId) }, '-hashedPassword -__v');
        
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
        console.error("Error fetching employee:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Toggle employee active status
const toggleEmployeeStatus = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findOne({ employeeId: Number(employeeId) });
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        
        employee.isActive = !employee.isActive;
        await employee.save();
        
        res.json({
            success: true,
            message: `Employee ${employee.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                employee: {
                    id: employee._id,
                    employeeId: employee.employeeId,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                    email: employee.email,
                    isActive: employee.isActive
                }
            }
        });
    } catch (error) {
        console.error("Error toggling employee status:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

// Update employee information
const updateEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { firstName, lastName, email, phone, address } = req.body;
        
        const employee = await Employee.findOne({ employeeId: Number(employeeId) });
        
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }
        
        // Check if email is being changed and if it's unique
        if (email && email !== employee.email) {
            const existingEmployee = await Employee.findOne({ email, _id: { $ne: employee._id } });
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
            message: "Employee updated successfully",
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
        console.error("Error updating employee:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getEmployeeList,
    getAttendanceRecords,
    getEmployeeById,
    toggleEmployeeStatus,
    updateEmployee
};

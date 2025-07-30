require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('../config/db');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const employeeData = [
  {
    firstName: 'Soumya',
    lastName: 'Gupta',
    email: 'soumyagupta881@gmail.com',
    password: 'Password123!'
  },
  {
    firstName: 'Soumya',
    lastName: 'Gupta',
    email: 'soumya.gupta_cs22@gla.ac.in',
    password: 'Password123!'
  },
  {
    firstName: 'Pulkit',
    lastName: 'Upadhyay',
    email: 'pulkit.upadhyay_cs22@gla.ac.in',
    password: 'Password123!'
  },
  {
    firstName: 'Soumya Kumar',
    lastName: 'Gupta',
    email: 'skgupta105031@gmail.com',
    password: 'Password123!'
  }
];

// Function to generate unique employee ID
const generateEmployeeId = async () => {
  let lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
  return lastEmployee ? lastEmployee.employeeId + 1 : 1000;
};

// Function to generate random clock-in/out times
const getRandomTime = (startHour, endHour) => {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return { hour, minute, second };
};

const seedEmployeesAndAttendance = async () => {
  try {
    await connectDB();
    // Log which database we're actually connected to
    const dbName = mongoose.connection.db.databaseName;
    console.log(`MongoDB connected for seeding to database: ${dbName}`);
    console.log(`Connection host: ${mongoose.connection.host}`);
    console.log('---');

    // Step 1: Register Employees
    console.log('🔄 Step 1: Registering employees...');
    
    const registeredEmployees = [];
    
    for (const empData of employeeData) {
      // Check if employee already exists
      const existingEmployee = await Employee.findOne({ email: empData.email });
      
      if (existingEmployee) {
        console.log(`✅ Employee ${empData.email} already exists (ID: ${existingEmployee.employeeId})`);
        registeredEmployees.push(existingEmployee);
        continue;
      }

      // Create new employee
      const employeeId = await generateEmployeeId();
      const hashedPassword = await bcrypt.hash(empData.password, 10);

      const newEmployee = new Employee({
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        hashedPassword: hashedPassword,
        employeeId: employeeId,
        role: 'employee',
        isActive: true
      });

      await newEmployee.save();
      registeredEmployees.push(newEmployee);
      console.log(`✅ Created employee: ${empData.email} (ID: ${employeeId})`);
    }

    console.log(`\n📊 Step 2: Creating attendance records for ${registeredEmployees.length} employees...`);

    // Step 2: Clear existing attendance records for these employees
    const employeeIds = registeredEmployees.map(e => e._id);
    await Attendance.deleteMany({ employeeId: { $in: employeeIds } });
    console.log('🗑️  Cleared existing attendance records for these employees.');

    // Step 3: Generate attendance data
    const today = new Date();
    const recordsToCreate = [];

    for (const employee of registeredEmployees) {
      console.log(`📝 Generating attendance records for ${employee.email}...`);
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        // Skip weekends (Saturday/Sunday)
        if (date.getDay() === 0 || date.getDay() === 6) {
          continue;
        }

        // 10% chance of being absent
        if (Math.random() < 0.1) {
          continue; // Skip creating a record for this day
        }

        const clockInTime = new Date(date);
        const { hour: inHour, minute: inMinute, second: inSecond } = getRandomTime(8, 10);
        clockInTime.setHours(inHour, inMinute, inSecond);

        // Determine if late (after 9:30 AM)
        const isLate = inHour > 9 || (inHour === 9 && inMinute > 30);

        const clockOutTime = new Date(date);
        const { hour: outHour, minute: outMinute, second: outSecond } = getRandomTime(17, 19);
        clockOutTime.setHours(outHour, outMinute, outSecond);

        const totalHoursWorked = (clockOutTime - clockInTime) / (1000 * 60 * 60);

        const attendanceRecord = {
          employeeId: employee._id,
          clockInTime,
          clockOutTime,
          totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
          date: new Date(date.setHours(0, 0, 0, 0)),
          isLate,
          status: 'present',
          location: {
            clockIn: {
              latitude: 27.605883 + (Math.random() - 0.5) * 0.01,
              longitude: 77.593575 + (Math.random() - 0.5) * 0.01,
            },
            clockOut: {
              latitude: 27.605883 + (Math.random() - 0.5) * 0.01,
              longitude: 77.593575 + (Math.random() - 0.5) * 0.01,
            }
          }
        };
        recordsToCreate.push(attendanceRecord);
      }
    }

    // Step 4: Save attendance records
    if (recordsToCreate.length > 0) {
      await Attendance.insertMany(recordsToCreate);
      console.log(`\n🎉 SUCCESS! Created ${recordsToCreate.length} attendance records for ${registeredEmployees.length} employees.`);
    } else {
      console.log('⚠️  No attendance records were generated.');
    }

    // Step 5: Display summary
    console.log('\n📋 EMPLOYEE SUMMARY:');
    console.log('='.repeat(50));
    for (const emp of registeredEmployees) {
      const recordCount = recordsToCreate.filter(r => r.employeeId.equals(emp._id)).length;
      console.log(`👤 ${emp.firstName} ${emp.lastName}`);
      console.log(`   📧 Email: ${emp.email}`);
      console.log(`   🆔 Employee ID: ${emp.employeeId}`);
      console.log(`   📊 Attendance Records: ${recordCount}`);
      console.log(`   🔑 Password: Password123!`);
      console.log('');
    }

    console.log('🚀 You can now log in with any of these employees using their email and password: Password123!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected.');
  }
};

seedEmployeesAndAttendance();

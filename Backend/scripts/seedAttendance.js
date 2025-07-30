
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

const employeeEmails = [
  'soumyagupta881@gmail.com',
  'soumya.gupta_cs22@gla.ac.in',
  'pulkit.upadhyay_cs22@gla.ac.in',
  'skgupta105031@gmail.com'
];

// Function to generate random clock-in/out times
const getRandomTime = (startHour, endHour) => {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  return { hour, minute, second };
};

const seedAttendanceData = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected for seeding...');

    const employees = await Employee.find({ email: { $in: employeeEmails } });

    if (employees.length === 0) {
      console.log('No employees found for the provided emails. Please register them first.');
      return;
    }
    
    console.log(`Found ${employees.length} employees to seed attendance for.`);

    // Clear existing attendance records for these employees to avoid duplicates
    const employeeIds = employees.map(e => e._id);
    await Attendance.deleteMany({ employeeId: { $in: employeeIds } });
    console.log('Cleared existing attendance records for these employees.');

    const today = new Date();
    const recordsToCreate = [];

    for (const employee of employees) {
      console.log(`Generating records for ${employee.email}...`);
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
        const { hour: inHour, minute: inMinute, second: inSecond } = getRandomTime(8, 10); // Clock in between 8 AM and 10 AM
        clockInTime.setHours(inHour, inMinute, inSecond);

        const isLate = inHour >= 9 && inMinute > 30; // Late if after 9:30 AM

        const clockOutTime = new Date(date);
        const { hour: outHour, minute: outMinute, second: outSecond } = getRandomTime(17, 19); // Clock out between 5 PM and 7 PM
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
          location: { // Add dummy location data
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

    if (recordsToCreate.length > 0) {
      await Attendance.insertMany(recordsToCreate);
      console.log(`✅ Successfully seeded ${recordsToCreate.length} attendance records for ${employees.length} employees.`);
    } else {
      console.log('No records were generated to seed.');
    }

  } catch (error) {
    console.error('❌ Error seeding attendance data:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedAttendanceData();


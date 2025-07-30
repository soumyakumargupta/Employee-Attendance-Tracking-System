const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    clockInTime: {
        type: Date,
        required: true
    },
    clockOutTime: {
        type: Date
    },
    totalHoursWorked: {
        type: Number,
        min: 0
    },
    date: {
        type: Date,
        required: true
    },
    isLate: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["present", "absent"],
        default: "present"
    },
    location: {
        clockIn: {
            latitude: { 
                type: Number,
                required: true,
                min: -90,
                max: 90
            },
            longitude: {
                type: Number,
                required: true,
                min: -180,
                max: 180
            }
        },
        clockOut: {
            latitude: { 
                type: Number,
                min: -90,
                max: 90
            },
            longitude: {
                type: Number,
                min: -180,
                max: 180
            }
        }
    }

}, {timestamps: true});

module.exports = mongoose.model("Attendance", attendanceSchema);
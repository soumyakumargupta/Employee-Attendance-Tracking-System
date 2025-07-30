const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["employee", "admin"],
        default: "employee"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    employeeId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    }
}, {timestamps: true});

module.exports = mongoose.model("Employee", employeeSchema);
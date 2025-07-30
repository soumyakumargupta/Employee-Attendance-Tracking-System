const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/appConfig');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

async function createAdmin() {
    try {
        await connectDB();
        
        // Delete existing admin
        await Admin.deleteOne({ email: config.admin_email });
        
        // Create new admin
        const hashedPassword = await bcrypt.hash(config.admin_password, 10);
        
        const admin = new Admin({
            firstName: "Soumya",
            lastName: "Kumar", 
            email: config.admin_email,
            hashedPassword: hashedPassword,
            role: "admin"
        });
        
        await admin.save();
        console.log(`Admin created successfully with email: ${config.admin_email}`);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
}

createAdmin();

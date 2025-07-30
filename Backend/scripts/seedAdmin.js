const mongoose = require('mongoose');
const config = require('../config/appConfig');
const {admin_email: adminEmail, admin_password: adminPassword} = config;
const Admin = require('../models/Admin');
const connectDB = require('../config/db');
const bcrypt = require('bcrypt');

async function seedAdmin(){
    try{
        await connectDB();

        const existingAdmin = await Admin.findOne({email: adminEmail});
        if(existingAdmin){
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = new Admin({
            firstName: "Soumya",
            lastName: "Kumar Gupta",
            email: adminEmail,
            hashedPassword: hashedPassword
        });

        await admin.save();
        console.log(`Admin created successfully with email: ${adminEmail}`);
        process.exit(0);
    }catch(error){
        console.error("Error Creating Admin", error);
        process.exit(1);
    }
}

seedAdmin();

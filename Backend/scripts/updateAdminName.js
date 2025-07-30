const mongoose = require('mongoose');
const config = require('../config/appConfig');
const {admin_email: adminEmail} = config;
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

async function updateAdminName(){
    try{
        await connectDB();

        const existingAdmin = await Admin.findOne({email: adminEmail});
        if(!existingAdmin){
            console.log("Admin not found");
            process.exit(1);
        }

        // Update the admin name
        existingAdmin.firstName = "Soumya";
        existingAdmin.lastName = "Kumar Gupta";
        
        await existingAdmin.save();
        console.log(`Admin name updated successfully to: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
        process.exit(0);
    }catch(error){
        console.error("Error updating admin name:", error);
        process.exit(1);
    }
}

updateAdminName();

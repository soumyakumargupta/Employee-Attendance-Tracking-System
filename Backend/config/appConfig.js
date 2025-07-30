require('dotenv').config();
const [officeStartHour, officeStartMinute] = process.env.OFFICE_START_TIME.split(":").map(Number);

const appConfig = {
    port: process.env.PORT || 5000,
    mongo_uri: process.env.MONGO_URI,
    jwt_secret: process.env.JWT_SECRET,
    admin_password: process.env.ADMIN_PASSWORD,
    admin_email: process.env.ADMIN_EMAIL,
    smtp_host:process.env.SMTP_HOST,
    smtp_port:process.env.SMTP_PORT,
    smtp_secure:process.env.SMTP_SECURE,
    smtp_user:process.env.SMTP_USER,
    smtp_pass:process.env.SMTP_PASS,
    smtp_from_email:process.env.SMTP_FROM_EMAIL,
    office_lat: parseFloat(process.env.OFFICE_LAT),
    office_lon: parseFloat(process.env.OFFICE_LON),
    allowed_distance_meters: parseInt(process.env.ALLOWED_DISTANCE_METERS),
    officeStartHour,
    officeStartMinute

}


if(!appConfig.mongo_uri){
    throw new Error("MONGO_URI environment variable is required");
}

if(!appConfig.admin_email){
    throw new Error("ADMIN_EMAIL environment variable is required");
}

if(!appConfig.admin_password){
    throw new Error("ADMIN_PASSWORD environment variable is required");
}

module.exports = appConfig;
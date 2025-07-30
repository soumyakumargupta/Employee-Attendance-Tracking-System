const config = require('../config/appConfig');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role || "admin",
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    };

    if(user.employeeId){
        payload.employeeId = user.employeeId;
    }

    return jwt.sign(payload, config.jwt_secret, {expiresIn: '1d'});
};

module.exports = generateToken;
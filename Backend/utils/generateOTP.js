const crypto = require('crypto');

const generateOTP = () => {
    const otp = crypto.randomInt(0, 1000000);
    return otp.toString().padStart(6, '0');
};

module.exports = generateOTP;
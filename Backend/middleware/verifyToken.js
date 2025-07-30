const config = require('../config/appConfig');
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            message: "No token provided"
        });
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, config.jwt_secret);
        req.user = decoded;
        next();
    }catch(e){
        return res.status(401).json({
            message: "Invalid or Expired token"
        });
    }
};

module.exports = verifyToken;
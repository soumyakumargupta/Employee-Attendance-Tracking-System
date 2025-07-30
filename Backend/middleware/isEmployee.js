const isEmployee = (req, res, next) => {
    if(req.user && req.user.role === "employee"){
        return next();
    }
    else{
        return res.status(403).json({message: "Only employees can perform this action"});
    }
}

module.exports = isEmployee;
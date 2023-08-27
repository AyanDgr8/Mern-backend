// src/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const userInfo = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = userInfo.id;
        const userName = userInfo.name;
        req.userName = userName;
        next(); 
    } catch(err){
        res.status(401).json({
            errorDesc: "Authentication failed!",
            error: err
        })
    }
}
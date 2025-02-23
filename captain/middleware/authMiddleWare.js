const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model'); // Adjust the path
const blacklisttoken = require("../models/blacklisttoken.model");
const blacklisttokenModel = require('../models/blacklisttoken.model');

module.exports.userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const isblacklisted = await blacklisttokenModel.find({token})
        
        if(isblacklisted.length){
            return res.status(401).json({message:"Unaurthorized"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

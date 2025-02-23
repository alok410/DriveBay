const jwt = require('jsonwebtoken');
const captainModel = require('../models/captain.model'); // Adjust the path
const blacklisttokenModel = require('../models/blacklisttoken.model');

module.exports.captainAuth = async (req, res, next) => {
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
        const captain = await captainModel.findById(decoded.id);

        if (!captain) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.captain = captain;
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

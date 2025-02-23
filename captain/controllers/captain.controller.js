require('dotenv').config();
const captainModel = require("../models/captain.model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const blacklisttokenModel = require("../models/blacklisttoken.model");

module.exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(name);
        
        const captain = await captainModel.findOne({ email });
        if (captain) {
            return res.status(400).json({ message: "captain already exists", success: false });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newcaptain = new captainModel({ name, email, password: hashPassword });

        await newcaptain.save();

        const token = jwt.sign({ id: newcaptain._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        delete captain._doc.password
        res.cookie("token", token);
        res.send({ message: "captain created successfully", success: true });

    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const captain = await captainModel.findOne({ email }).select("+password");

        if (!captain) {
            return res.status(400).json({ message: "captain not found", success: false });
        }

        const isMatch = await bcrypt.compare(password, captain.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password", success: false });
        }

        const token = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        delete captain._doc.password
        res.cookie("token", token);
        res.send({ message: "captain logged in successfully", success: true });

    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

module.exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        await blacklisttokenModel.create({ token });
        res.clearCookie('token');
        res.json({ message: 'captain logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.profile = async (req, res) => {
    try {
        res.send(req.captain);
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

module.exports.toggleAvailability= async(req,res) =>{
    try {
        const captain = await captainModel.findById(req.captain._id);
        captain.isAvailable = !captain.isAvailable;
        await captain.save();
        res.send(captain)
    } catch (error) {
            res.status(500).json({message:error.message})
    }
}
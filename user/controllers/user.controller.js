require('dotenv').config();
const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const blacklisttokenModel = require("../models/blacklisttoken.model");

module.exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(name);
        
        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists", success: false });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({ name, email, password: hashPassword });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        // delete user._doc.password
        res.cookie("token", token);
        res.send({ message: "User created successfully", success: true });

    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password", success: false });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        delete user._doc.password
        res.cookie("token", token);
        res.send({ message: "User logged in successfully", success: true });

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
        res.json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.profile = async (req, res) => {
    try {
        res.send(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

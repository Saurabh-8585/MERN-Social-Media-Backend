const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const generateToken = (user) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,);
    return token;
};

const SignUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        const token = generateToken(newUser);
        res.cookie('token', token, {
            httpOnly: true,
        });

        res.status(200).json({ message: 'Sign Up successfully', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.cookie('token', token, {
            httpOnly: true,
        });

        res.status(200).json({ message: 'Sign In successfully', token });
    } catch (error) {

        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    let user = req.user;
    try {
        const isUser = await User.findById(user);

        if (!isUser) {
            return res.status(401).json({ message: 'User not found' });
        } else {
            await User.findByIdAndDelete(isUser._id);
            return res.status(200).json({ message: 'Deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { SignIn, SignUp, deleteUser }
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const SendEmailTemplate = require('../template/SendEmailLink')
const generateToken = (user) => {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,);
    return token;
};

const SignUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        const token = generateToken(newUser);
        res.cookie('token', token);

        res.status(200).json({ message: `Welcome ${newUser.username}`, token });
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

        res.cookie('token', token);

        res.status(200).json({ message: `Welcome Back ${user.username}`, token });
    } catch (error) {

        return res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const userID = req.user;
    const { oldPassword, newPassword } = req.body;


    try {
        const user = await User.findById(userID)

        const comparePassword = await bcrypt.compare(oldPassword, user.password)

        if (!comparePassword) {
            return res.status(401).json({ message: 'Old password is invalid' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatePassword = await User.findByIdAndUpdate(user, { $set: { password: hashedPassword } })

        res.status(200).json({ message: 'Password update successfully ' });

    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const secretKey = user._id + process.env.JWT_SECRET;
        const token = jwt.sign({ userID: user._id }, secretKey, { expiresIn: '5m' });
        const link = `${process.env.FORGOT_PASSWORD}/${user._id}/${token}`;
        const emailContent =await SendEmailTemplate(link)
        console.log({
            secretKey,
            token,
            link,
            emailContent,
        });
        const transport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.email",
            secure: true,
            port: 465,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            },
        })
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset Request",
            html: emailContent
        }

        transport.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.send({ message: error });
            } else {
                return res.send({ message: 'Email Sent. Please Check Your Email' });
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { SignIn, SignUp, resetPassword, forgotPassword }
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
// const SendEmailTemplate = require('../template/SendEmailLink')
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
        
        let config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        }

        let transporter = nodemailer.createTransport(config);

        let MailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "Mailgen",
                link: 'https://mailgen.js/'
            }
        })

        let response = {
            body: {
                name: "Daily Tuition",
                intro: "Your bill has arrived!",
                table: {
                    data: [
                        {
                            item: "Nodemailer Stack Book",
                            description: "A Backend application",
                            price: "$10.99",
                        }
                    ]
                },
                outro: "Looking forward to do more business"
            }
        }

        let mail = MailGenerator.generate(response)

        let message = {
            from: process.env.EMAIL,
            to: email,
            subject: "Place Order",
            html: mail
        }

        transporter.sendMail(message).then(() => {
            return res.status(201).json({
                msg: "you should receive an email"
            })
        }).catch(error => {
            return res.status(500).json({ error })
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { SignIn, SignUp, resetPassword, forgotPassword }
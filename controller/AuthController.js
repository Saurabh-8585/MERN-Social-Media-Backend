const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const { messageInfo, config } = require('../Mail/MailUtils');
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

        await User.findByIdAndUpdate(user, { $set: { password: hashedPassword } })
        let transporter = nodemailer.createTransport(config);
        let MailGenerator = new Mailgen({
            theme: {
                customCss: '.body { font-family: Arial, sans-serif; } .footer { text-align: center; }'
            },
            product: {
                name: "Snapia",
                link: process.env.FRONTEND_URL
            }
        })
        const response = {
            body: {
                name: user.username,
                intro: 'Password Reset Successful',
                content: 'Your password has been successfully reset. You can now log in using your new password.',
                outro: 'If you did not request a password reset, please contact our support team immediately.',
                signature: 'Best regards,\nSnapia', // Add your custom email signature here
            },


        };
        let mail = MailGenerator.generate(response)
        let mailMessage = messageInfo(user.email, 'Password Reset Successful', mail)
        transporter.sendMail(mailMessage)
            .catch(() => res.status(500).json({ message: 'Oops! Something went wrong. Please try again later.' }))

        return res.status(200).json({ message: 'Password update successfully ' });

    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const secretKey = user._id + process.env.JWT_SECRET;
        const token = jwt.sign({ userID: user._id }, secretKey, { expiresIn: '5m' });
        const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;

        let transporter = nodemailer.createTransport(config);
        let MailGenerator = new Mailgen({
            theme: {
                customCss: '.body { font-family: Arial, sans-serif; } .footer { text-align: center; }'
            },
            product: {
                name: "Snapia",
                link: process.env.FRONTEND_URL
            }
        })

        const response = {
            body: {
                name: user.username,
                intro: 'Forgot Password Request',
                action: {
                    instructions: 'You are receiving this email because you requested a password reset. To reset your password, click the button below:',
                    button: {
                        color: '#A855F7',
                        text: 'Reset Your Password',
                        link
                    },
                },
                outro: 'If you did not request a password reset, please ignore this email.',
                signature: 'Best regards,\nSnapia Team',
            },
        };

        let mail = MailGenerator.generate(response)

        let mailMessage = messageInfo(user.email, 'Forgot Password Request', mail)

        transporter.sendMail(mailMessage)
            .then(() => res.status(201).json({ message: 'An email has been sent. Please check your inbox.' }))
            .catch(() => res.status(500).json({ message: 'Oops! Something went wrong. Please try again later.' }));


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const addNewPassword = async (req, res) => {
    const { id, token } = req.params;
    const { newPassword } = req.body;
    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const secretKey = user._id + process.env.JWT_SECRET
        try {
            const isValid = jwt.verify(token, secretKey);
            if (isValid) {
                const hashPassword = await bcrypt.hash(newPassword, 10);
                await User.findByIdAndUpdate(user._id, { $set: { password: hashPassword } });
                let transporter = nodemailer.createTransport(config);

                let MailGenerator = new Mailgen({
                    theme: {
                        customCss: '.body { font-family: Arial, sans-serif; } .footer { text-align: center; }'
                    },
                    product: {
                        name: "Snapia",
                        link: process.env.FRONTEND_URL
                    }
                })
                const response = {
                    body: {
                        name: user.username,
                        intro: 'Password Reset Successful',
                        content: 'Your password has been successfully reset. You can now log in using your new password.',
                        outro: 'If you did not request a password reset, please contact our support team immediately.',
                        signature: 'Best regards,\nSnapia',
                    },


                };
                let mail = MailGenerator.generate(response)
                let mailMessage = messageInfo(user.email, 'Password Reset Successful', mail)
                transporter.sendMail(mailMessage)
                    .then(() => res.status(200).json({ message: 'Password updated successfully' }))
                    .catch(() => res.status(500).json({ message: 'Oops! Something went wrong. Please try again later.' }))
            }
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return res.status(400).json({ message: 'Link has been expired' });
            }
            throw err;
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
}


module.exports = { SignIn, SignUp, resetPassword, forgotPassword, addNewPassword,generateToken }
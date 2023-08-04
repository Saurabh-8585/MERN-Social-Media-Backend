const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
const { generateMail } = require('../Mail/MailUtils');
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
        res.status(200).json({ message: `Welcome ${newUser.username}`, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
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

        return res.status(500).json({ message: 'Something went wrong' });
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
        const response = {
            body: {
                name: user.username,
                intro: 'Password Reset Successful',
                content: 'Your password has been successfully reset. You can now log in using your new password.',
                outro: 'If you did not request a password reset, please contact our support team immediately.',
                signature: 'Best regards,\nSnapia', // Add your custom email signature here
            }
        };

        await generateMail({
            emailBody: response,
            to: user.email,
            subject: 'Password Reset Successful'
        });

        return res.status(200).json({ message: 'Password update successfully ' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        console.log({ user });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const secretKey = user._id + process.env.JWT_SECRET;
        const token = jwt.sign({ userID: user._id }, secretKey, { expiresIn: '5m' });
        const link = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;


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

        await generateMail({
            emailBody: response,
            to: user.email,
            subject: 'Forgot Password Request'
        });

        res.status(201).json({ message: 'An email has been sent. Please check your inbox.' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong' });
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

                const response = {
                    body: {
                        name: user.username,
                        intro: 'Password Reset Successful',
                        content: 'Your password has been successfully reset. You can now log in using your new password.',
                        outro: 'If you did not request a password reset, please contact our support team immediately.',
                        signature: 'Best regards,\nSnapia',
                    },


                };
                await generateMail({
                    emailBody: response,
                    to: user.email,
                    subject: 'Password Reset Successful'
                });
                res.status(200).json({ message: 'Password updated successfully' })
            }
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                return res.status(400).json({ message: 'Link has been expired' });
            }

          
            throw err;
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}


module.exports = { SignIn, SignUp, resetPassword, forgotPassword, addNewPassword, generateToken }
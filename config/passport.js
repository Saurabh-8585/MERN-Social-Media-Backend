const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');
const { generateToken } = require('../controller/AuthController');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const { generateMail } = require('../Mail/MailUtils');




function generateRandomPassword() {
    const specialChars = '!@#$%^&*()_-+=<>?';
    const digits = '0123456789';
    const allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const allChars = allowedChars + specialChars + digits;
    const minLength = 6;
    const maxLength = 16;
    const passwordLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
        const char = allChars[Math.floor(Math.random() * allChars.length)];
        password += char;
    }
    return password;
}


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            scope: ['profile', 'email'],
        },
        async function (accessToken, refreshToken, profile, done) {
            try {
                const existingUser = await User.findOne({ email: profile.emails[0].value });
                if (existingUser) {
                    const userToken = generateToken(existingUser);
                    return done(null, { message: `Welcome back ${existingUser.username}`, token: userToken });
                }

                let tempPassword = generateRandomPassword();
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                const newUser = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    password: hashedPassword,
                });

                await newUser.save();
                const token = generateToken(newUser);

                const response = {
                    body: {
                        name: profile.displayName,
                        intro: 'Welcome to Snapia!',
                        outro: [
                            'You are receiving this email because you logged in with your Google account. As this is your first login, we have generated a temporary password for you',

                            `<b>Temporary Password </b> : ${tempPassword}`,

                            'For security purposes, we recommend that you change this temporary password at your earliest convenience. You can do so by visiting your account settings on Snapia\'s platform.',

                            'If you have any questions or need further assistance, feel free to reach out to our support team. Welcome to Snapia, and we look forward to providing you with a seamless experience!',

                        ],

                        signature: 'Best regards,<br>Snapia Team'
                    }
                };

                await generateMail({
                    emailBody: response,
                    to: profile.emails[0].value,
                    subject: 'Welcome to Snapia!'
                });
                return done(null, { message: `Welcome ${newUser.username} ,Please check mail`, token });
            } catch (error) {

                return done(error, false);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;

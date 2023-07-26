const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');
const { generateToken } = require('../controller/AuthController');
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const { messageInfo, config } = require('../Mail/MailUtils');




function generateRandomPassword() {
    const specialChars = '!@#$%^&*()_-+=<>?';
    const digits = '0123456789';
    const allowedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const allChars = allowedChars + specialChars + digits;
    let password = '';
    for (let i = 0; i < 16; i++) {
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


                // let transporter = nodemailer.createTransport(config);
                // let MailGenerator = new Mailgen({
                //     theme: {
                //         customCss: '.body { font-family: Arial, sans-serif; } .footer { text-align: center; }'
                //     },
                //     product: {
                //         name: "Snapia",
                //         link: process.env.FRONTEND_URL
                //     }
                // });

                // const response = {
                //     body: {
                //         name: newUser.username,
                //         intro: 'Welcome to Snapia!',
                //         content: `You are receiving this email because you logged in with your Google account. As this is your first login, we have generated a temporary password for you: here is your temporary password : ${tempPassword}`,
                //         outro: 'You can change your password whenever you want by going to your account settings.',
                //         signature: 'Best regards,\nSnapia Team',
                //     },
                // };

                // let mail = MailGenerator.generate(response)

                // let mailMessage = messageInfo(newUser.email, 'Welcome to Snapia', mail)
                // transporter.sendMail(mailMessage).catch((error) => {
                //     return done(error, false);
                // });
                return done(null, { message: `Welcome ${newUser.username}`, token });
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

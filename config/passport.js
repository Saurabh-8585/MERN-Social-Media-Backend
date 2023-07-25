const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');
const { generateToken } = require('../controller/AuthController');
const dotenv = require('dotenv').config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
            scope: ['profile', 'email'],
        },
        async function (accessToken, refreshToken, profile, done) {
            const existingUser = await User.findOne({ email: profile.emails[0].value });
            if (existingUser) {
                const userToken = generateToken(existingUser);
                return done(null, { message: `Welcome ${existingUser.username}`, token: userToken });
            }
            const newUser = new User({
                username: profile.displayName,
                email: profile.emails[0].value,
            });
            // we can add temporary password and send it on user email id
            await newUser.save();
            const token = generateToken(newUser);
            return done(null, { message: `Welcome ${newUser.username}`, token });
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

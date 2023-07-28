const express = require('express');
const passport = require('passport');
const { SignUp, SignIn, resetPassword, forgotPassword, addNewPassword } = require('../controller/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');
const dotenv = require('dotenv').config();

const router = express.Router();

router.post('/signup', SignUp);
router.post('/signin', SignIn);
router.put('/reset', authMiddleware, resetPassword);
router.post('/forgot/password', forgotPassword);
router.put('/new/password/:id/:token', addNewPassword);

// Login with Google
router.get('/login/success', (req, res) => {
    const responseData = req.user
        ? {
            message: 'Login Success',
            user: req.user,
            error: false,
        }
        : {
            error: true,
            message: 'Not Authorized',
        };

    const status = req.user ? 200 : 401;
    res.status(status).json(responseData);
});

router.get('/login/failed', (req, res) => {
    res.status(401).json({
        error: true,
        message: 'Log in Failed',
    });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', {
    successRedirect: `${process.env.FRONTEND_URL}/login/success`,
    failureRedirect: process.env.FRONTEND_URL,
}));

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return res.status(500).json({ error: true, message: 'Logout failed' });
        }
        res.redirect(process.env.FRONTEND_URL);
    });
});


module.exports = router;

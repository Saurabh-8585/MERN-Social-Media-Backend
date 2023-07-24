const express = require('express');
const passport = require('passport');
const dotenv = require('dotenv').config();
const { SignUp, SignIn, resetPassword, forgotPassword, addNewPassword } = require('../controller/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');


const router = express.Router();

router.post('/signup', SignUp);
router.post('/signin', SignIn);
router.put('/reset', authMiddleware, resetPassword)
router.post('/forgot/password', forgotPassword)
router.put('/new/password/:id/:token', addNewPassword)


// login with google
router.get('/login/success', (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: "Login Success",
            user: req.user,
            error: false
        })
    }
    else {
        res.status(401).json({
            error: true,
            message: "Not Authorized"
        })
    }
})
router.get('/login/failed', (req, res) => {
    res.status(401).json({
        error: true,
        message: "Log in Failed"
    })
})

router.get('/google/callback', passport.authenticate('google', {
    successRedirect: process.env.FRONTEND_URL_2,
    failureRedirect: '/login/failed'
}))



router.get('/google',passport.authenticate('google', ['profile', 'email']))

router.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect(process.env.process.env.FRONTEND_URL_2)

})

module.exports = router
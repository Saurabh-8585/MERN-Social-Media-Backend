const express = require('express');
const { SignUp, SignIn, resetPassword, forgotPassword } = require('../controller/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');


const router = express.Router();

router.post('/signup', SignUp);
router.post('/signin', SignIn);
router.put('/reset', authMiddleware, resetPassword)
router.post('/forgot-password', forgotPassword)


module.exports = router
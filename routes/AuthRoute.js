const express = require('express');
const { SignUp, SignIn,resetPassword } = require('../controller/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');


const router = express.Router();

router.post('/signup', SignUp);
router.post('/signin', SignIn);
router.put('/reset/:id', resetPassword)

module.exports = router
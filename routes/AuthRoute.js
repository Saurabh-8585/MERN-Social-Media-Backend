const express = require('express');
const { SignUp, SignIn, deleteUser } = require('../controller/AuthController');
const authMiddleware = require('../middleware/AuthMiddleware');


const router = express.Router();

router.post('/signup', SignUp);
router.post('/signin', SignIn);

module.exports = router
const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const { checkCurrentUser, deleteUser, followUser, getUserData } = require('../controller/UserController')




const router = express.Router();

// router.get('/currentuser', authMiddleware, checkCurrentUser);

// router.delete('/deleteuser/:id', authMiddleware, deleteUser);

// router.put('/follow/:id', authMiddleware, followUser);

router.get('/profile/:id', getUserData);

module.exports = router
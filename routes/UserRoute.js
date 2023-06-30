const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const { checkCurrentUser, deleteUser, followUser, getUserData, unFollowUser } = require('../controller/UserController')




const router = express.Router();

// router.get('/currentuser', authMiddleware, checkCurrentUser);

// router.delete('/deleteuser/:id', authMiddleware, deleteUser);


router.get('/:id', getUserData);

router.put('/follow/:id', authMiddleware, followUser);

router.delete('/unfollow/:id', authMiddleware, unFollowUser);


module.exports = router
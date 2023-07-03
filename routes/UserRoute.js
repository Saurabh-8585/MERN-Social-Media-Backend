const express = require('express');
const upload = require('../config/multer');
const authMiddleware = require('../middleware/AuthMiddleware');
const { deleteUser,
    followUser,
    getUserData,
    unFollowUser,
    updateUserProfile,  
    getAllUsers
} = require('../controller/UserController');




const router = express.Router();

// router.get('/currentuser', authMiddleware, checkCurrentUser);



router.get('/:id', getUserData);

router.get('/users', getAllUsers);

router.put('/follow/:id', authMiddleware, followUser);

router.delete('/unfollow/:id', authMiddleware, unFollowUser);

router.put('/update/:id', authMiddleware, upload, updateUserProfile)

router.delete('/deleteuser', authMiddleware, deleteUser);

module.exports = router
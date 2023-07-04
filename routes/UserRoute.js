const express = require('express');
const upload = require('../config/multer');
const authMiddleware = require('../middleware/AuthMiddleware');
const { deleteUser,
    followUser,
    getSingleUserData,
    unFollowUser,
    updateUserProfile,  
    getAllUsersData
} = require('../controller/UserController');




const router = express.Router();




router.get('/:id', getSingleUserData);


router.put('/follow/:id', authMiddleware, followUser);

router.delete('/unfollow/:id', authMiddleware, unFollowUser);

router.put('/update/:id', authMiddleware, upload, updateUserProfile)

router.delete('/deleteuser', authMiddleware, deleteUser);

router.get('/all/users', getAllUsersData);

module.exports = router
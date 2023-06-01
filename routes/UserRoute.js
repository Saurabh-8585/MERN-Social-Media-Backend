const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const { checkCurrentUser, deleteUser } = require('../controller/UserController')




const router = express.Router();

router.get('/currentuser', authMiddleware, checkCurrentUser);
router.delete('/deleteuser/:id', authMiddleware, deleteUser);

module.exports = router
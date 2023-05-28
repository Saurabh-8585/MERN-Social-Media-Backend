const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const { createPost, deletePost } = require('../controller/PostController')


const router = express.Router();

router.post('/newpost', authMiddleware, createPost);
router.delete('/deletepost/:postId', authMiddleware, deletePost);


module.exports = router
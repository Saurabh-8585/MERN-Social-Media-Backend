const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const {
    createPost,
    deletePost,
    getAllPost,
    editPost
}
    = require('../controller/PostController');
const upload = require('../config/multer');


const router = express.Router();

router.get('/getposts', getAllPost);
router.post('/newpost', upload, authMiddleware, createPost);
router.delete('/deletepost/:postId', authMiddleware, deletePost);
router.put('/editpost/:postId', authMiddleware, editPost);


module.exports = router
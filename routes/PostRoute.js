const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const {
    createPost,
    deletePost,
    getAllPost,
    editPost,
    singleUserPots
}
    = require('../controller/PostController');
const upload = require('../config/multer');


const router = express.Router();

router.get('/getposts', getAllPost);
router.get('/userposts/:id', singleUserPots);
router.post('/newpost', upload, authMiddleware, createPost);
router.delete('/deletepost/:id', authMiddleware, deletePost);
router.put('/editpost/:postId',upload, authMiddleware, editPost);


module.exports = router
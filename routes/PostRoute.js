const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const {
    createPost,
    deletePost,
    getAllPost,
    editPost,
    singleUserPosts,

}
    = require('../controller/PostController');
const upload = require('../config/multer');


const router = express.Router();

router.get('/posts', getAllPost);
router.get('/user/:id', singleUserPosts);
router.post('/new', upload, authMiddleware, createPost);
router.delete('/delete/:id', authMiddleware, deletePost);
router.put('/edit/:postId', upload, authMiddleware, editPost);


module.exports = router
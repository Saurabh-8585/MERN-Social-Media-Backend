const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const {
    createPost,
    deletePost,
    getAllPost,
    editPost,
    singleUserPosts,
    singlePost,

}
    = require('../controller/PostController');
const upload = require('../config/multer');


const router = express.Router();
// all post
router.get('/posts', getAllPost);
//single user all post
router.get('/user/:id', singleUserPosts);
// single post
router.get('/post/:id', singlePost);

router.post('/new', upload, authMiddleware, createPost);

router.delete('/delete/:id', authMiddleware, deletePost);

router.put('/edit/:postId', upload, authMiddleware, editPost);


module.exports = router
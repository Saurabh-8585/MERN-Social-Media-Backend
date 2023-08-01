const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const {
    createPost,
    deletePost,
    getAllPost,
    editPost,
    singleUserPosts,
    singlePost,
    likePost,
    removeLike,
    addComment,
    removeComment,
    editComment,

}
    = require('../controller/PostController');
const upload = require('../config/multer');


const router = express.Router();

router.get('/posts', getAllPost);

router.get('/user/:id', singleUserPosts);

router.get('/post/:id', singlePost);

router.post('/new', upload, authMiddleware, createPost);

router.delete('/delete/:id', authMiddleware, deletePost);

router.put('/edit/:postId', authMiddleware, editPost);

router.post('/like', authMiddleware, likePost);

router.delete('/dislike/:id', authMiddleware, removeLike);

router.post('/comment/:id', authMiddleware, addComment);

router.delete('/comment/delete/:PostID/:commentId', authMiddleware, removeComment);

router.put('/comment/edit/:PostID/:commentId', authMiddleware, editComment);


module.exports = router
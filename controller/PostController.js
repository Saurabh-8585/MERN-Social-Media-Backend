const getDataUri = require('../config/DataUri');
const Post = require('../models/Post')
const User = require('../models/User')
const cloudinary = require('../config/cloudinary');


const createPost = async (req, res) => {
    const { content } = req.body;
    const file = req.file;

    // console.log({content});

    const user = await User.findById(req.user);

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    try {

        let myCloud;
        if (file) {
            const fileUri = getDataUri(file);
            myCloud = await cloudinary.uploader.upload(fileUri.content, {
                folder: 'Snapia',
            });
        }

        const newPost = new Post({
            content,
            author: user._id,
            postImage: file
                ? {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                }
                : undefined,
        });

        const savedPost = await newPost.save();
        await savedPost.populate('author', '-password -updatedAt -createdAt');

        return res.status(200).json(savedPost);
    } catch (error) {
        console.log(error);
        // res.status(500).json({ message: 'Server error' });
    }
};

const deletePost = async (req, res) => {
    const { id } = req.params;
    let user = req.user;
    const isUser = await User.findById(user);
    if (!isUser) {
        return res.status(401).json({ message: 'User not found' });
    }

    const isPostAvailable = await Post.findById(id);
    if (!isPostAvailable) {
        return res.status(401).json({ message: 'Post not found' });
    }
    try {
        await Post.findByIdAndDelete(isPostAvailable._id)
        return res.status(200).json({ message: 'Posted Deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }

}

const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', '-password  -updatedAt -createdAt').sort({ createdAt: -1 });
        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

const editPost = async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const file = req.file;
    const user = req.user;
    try {

        const existingUser = await User.findById(user);
        const existingPost = await Post.findById(postId);
        
        if (!existingUser) {
            return res.status(401).json({ message: 'User not found' });
        }
        if (existingUser._id.toString() !== existingPost.author.toString()) {
            return res.status(401).json({ message: 'Unauthorized user' });
        }

        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }


        const updatedPost = await Post.findByIdAndUpdate(postId, { content }, { new: true });
        return res.status(200).json({ message: 'Post edited successfully', post: updatedPost });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const singleUserPosts = async (req, res) => {
    const { id } = req.params;
    try {
        const findUserPosts = await Post.find({ author: id });
        return res.status(200).json({ post: findUserPosts });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}














module.exports = { createPost, deletePost, getAllPost, editPost,  singleUserPosts }
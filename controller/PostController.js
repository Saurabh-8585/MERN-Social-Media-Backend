const getDataUri = require('../config/DataUri');
const Post = require('../models/Post')
const User = require('../models/User')
const cloudinary = require('../config/cloudinary');


const createPost = async (req, res) => {
    const { content, image } = req.body;

    const file = req.file;
    const fileUri = getDataUri(file);
    console.log(fileUri);
    const user = await User.findById(req.user);

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    try {

        const myCloud = await cloudinary.uploader.upload(fileUri.content);
       

        const newPost = new Post({
            content,
            author: user._id,
            postImage: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            },
        });

        const savedPost = await newPost.save().populate('author', '-password -updatedAt -createdAt');

        return res.status(200).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};




const deletePost = async (req, res) => {
    const { postId } = req.params;
    let user = req.user;
    const isUser = await User.findById(user);
    if (!isUser) {
        return res.status(401).json({ message: 'User not found' });
    }

    const isPostAvailable = await Post.findById(postId);
    if (!isPostAvailable) {
        return res.status(401).json({ message: 'Post not found' });
    }
    try {
        await Post.findByIdAndDelete(isPostAvailable._id)
        return res.status(200).json({ message: 'Posted Deleted successfully' });
    } catch (error) {
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
    try {
        const { postId } = req.params;
        const { content } = req.body;

        const user = req.user;

        const existingUser = await User.findById(user);
        if (!existingUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(401).json({ message: 'Post not found' });
        }

        if (existingUser._id.toString() !== existingPost.author.toString()) {
            return res.status(401).json({ message: 'Unauthorized user' });
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, { content }, { new: true });
        if (!updatedPost) {
            throw new Error('Failed to update post');
        }

        return res.status(200).json({ message: 'Post edited successfully', post: updatedPost });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};












module.exports = { createPost, deletePost, getAllPost, editPost }
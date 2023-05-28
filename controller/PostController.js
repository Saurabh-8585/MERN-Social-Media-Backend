const Post = require('../models/Post')
const User = require('../models/User')


const createPost = async (req, res) => {
    const { content } = req.body;
    let user = req.user;
    const isUser = await User.findById(user);
    if (!isUser) {
        return res.status(401).json({ message: 'User not found' });
    }
    try {
        const newPost = new Post({
            content,
            author: isUser._id,
        });
        await newPost.save();
        return res.status(200).json({ message: 'Posted successfully' });
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
        const posts = await Post.find().populate('author', '-password -email -updatedAt -createdAt');
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
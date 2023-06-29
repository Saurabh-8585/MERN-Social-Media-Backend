const Post = require('../models/Post');
const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();



const followUser = async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    try {
        const reqUser = await User.findById(id);

        if (!reqUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isFollowed = reqUser.followers.includes(id)

        if (isFollowed) {
            return res.status(401).json({ message: 'Already following' });
        }
        user.follow.push(id)

        await user.save()


    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}

const getUserData = async (req, res) => {
    const { id } = req.params;
    try {
        const isUser = await User.findById(id);
        if (!isUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        const userInfo = await User.findById(id)
            .populate({
                path: 'followers',
                select: '-password -updatedAt -createdAt -email',
            })
            .populate({
                path: 'following',
                select: '-password -updatedAt -createdAt -email',
            })
            .select('-password -updatedAt -email');

        const posts = await Post.find({ author: id })
            .populate({
                path: 'author',
                select: '-password -updatedAt -createdAt -email',
            })
            .populate({
                path: 'likes',
                select: '-password -updatedAt -createdAt -email',
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'user commentLikes',
                    select: '-password -updatedAt -createdAt -email',
                },
            });
        const userData = { userInfo, posts }

        return res.status(200).json(userData);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const checkCurrentUser = async (req, res) => {
    let user = req.user;
    try {
        const isUser = await User.findById(user);

        if (!isUser) {
            return res.status(401).json({ message: 'User not found' });
        } else {
            return res.status(200).json({ id: isUser._id });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
}
const deleteUser = async (req, res) => {
    let user = req.user;

    try {
        const isUser = await User.findById(user);

        if (!isUser) {
            return res.status(401).json({ message: 'User not found' });
        } else {
            await User.findByIdAndDelete(isUser._id);
            return res.status(200).json({ message: 'Deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { checkCurrentUser, deleteUser, followUser, getUserData }
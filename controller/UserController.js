const Post = require('../models/Post');
const User = require('../models/User');
const BookMark = require('../models/BookMark');
const Comment = require('../models/Comment');
const cloudinary = require('../config/cloudinary');
const getDataUri = require('../config/DataUri');

const dotenv = require('dotenv').config();



const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        // console.log(users);
        return res.status(200).json(users);
    } catch (error) {
        // console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

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
                select: '_id username',
            })
            .populate({
                path: 'following',
                select: '_id username',
            })
            .select('-password -updatedAt');

        const userData = { userInfo }

        return res.status(200).json(userData);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};





const followUser = async (req, res) => {
    const { id } = req.params;
    const userId = req.user;

    try {
        const userToFollow = await User.findById(id);
        const requestingUser = await User.findById(userId);

        if (!requestingUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isFollowing = requestingUser.following.includes(id);
        const isFollower = userToFollow.followers.includes(userId);

        if (isFollowing || isFollower) {
            return res.status(401).json({ message: 'Already following' });
        }

        requestingUser.following.push(userToFollow._id);
        userToFollow.followers.push(requestingUser._id);
        await requestingUser.save();
        await userToFollow.save();

        return res.status(200).json({ message: 'Followed Successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


const unFollowUser = async (req, res) => {
    const { id } = req.params;
    const userId = req.user;

    try {
        const userToFollow = await User.findById(id);
        const requestingUser = await User.findById(userId);
        if (!requestingUser) {
            return res.status(401).json({ message: 'User not found' });
        }


        const isFollowing = requestingUser.following.includes(id);
        const isFollower = userToFollow.followers.includes(userId)
        if (!isFollower || !isFollowing) {
            return res.status(401).json({ message: 'You are not follower' });
        }

        requestingUser.following = requestingUser.following.filter((user) => user._id.toString() !== id);
        userToFollow.followers = userToFollow.followers.filter((user) => user._id.toString() !== userId);
        await requestingUser.save();
        await userToFollow.save()
        return res.status(200).json({ message: 'Unfollowed Successfully' });

    } catch (error) {

        return res.status(500).json({ message: 'Server error' });
    }
}


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


const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { email, username, about, selectedFile, imageId, image } = req.body;
    const file = req.file;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!file) {
            if (user.userImage.public_id) {
                await cloudinary.uploader.destroy(user.userImage.public_id);
                user.userImage = null;
            }
        }


        if (file && image) {
            if (user.userImage.public_id) {
                await cloudinary.uploader.destroy(user.userImage.public_id);
            }
            const fileUri = getDataUri(file);
            const myCloud = await cloudinary.uploader.upload(fileUri.content, {
                folder: 'Snapia',
            });
            const userImage = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };

            user.userImage = userImage;
        }

        user.email = email;
        user.username = username;
        user.about = about;


        await user.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }

};

const deleteUser = async (req, res) => {
    let userId = req.user;

    try {
        const findUser = await User.findById(userId);

        if (!findUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (findUser.userImage && findUser.userImage.public_id) {
            await cloudinary.uploader.destroy(findUser.userImage.public_id);
        }

        await User.updateMany(
            { 'followers': userId },
            { $pull: { 'followers': userId } }
        );
        await User.updateMany(
            { 'following': userId },
            { $pull: { 'following': { $in: [userId] } } }
        );
        await User.findByIdAndDelete(userId);

        await Post.deleteMany({ author: userId, })
        await Post.updateMany(
            { 'likes': userId },
            { $pull: { 'likes': userId } }
        );

        await Comment.deleteMany({ user: userId })
        await Comment.updateMany(
            { 'commentLikes': userId },
            { $pull: { 'commentLikes': userId } }
        );

        await BookMark.deleteMany({ user: userId })

        return res.status(200).json({ message: 'Account deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { checkCurrentUser, getAllUsers,followUser, getUserData, unFollowUser, updateUserProfile, deleteUser }
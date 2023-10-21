const Post = require('../models/Post');
const User = require('../models/User');
const BookMark = require('../models/BookMark');
const cloudinary = require('../config/cloudinary');
const getDataUri = require('../config/DataUri');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const dotenv = require('dotenv').config();



const getAllUsersData = async (req, res) => {
    try {
        const users = await User.find()
            .populate({
                path: 'followers',
                select: '_id username',
            })
            .populate({
                path: 'following',
                select: '_id username',
            })
            .select('-password -updatedAt -email -createdAt');;


        const usersWithPostCount = await Promise.all(
            users.map(async (user) => {
                const postCount = await Post.find({ author: user._id }).countDocuments();
                return { ...user.toObject(), postCount };
            })
        );

        return res.status(200).json(usersWithPostCount);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};


const getSingleUserData = async (req, res) => {
    const { id } = req.params;
    try {
        const isUser = await User.findById(id);
        if (!isUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        const userInfo = await User.findById(id)
            .populate({
                path: 'followers',
                select: '_id username userImage',
            })
            .populate({
                path: 'following',
                select: '_id username userImage',
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

const updateUserProfile = async (req, res) => {
    const { id } = req.params;
    const { email, username, about, location, image, website } = req.body;
    const file = req.file;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!file) {
            const isGoogleUser = user.userImage && user.userImage.url && user.userImage.url.includes('googleusercontent');
            if (isGoogleUser) {
                user.userImage = null;
            } else if (user.userImage.public_id) {
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
        if (about !== 'undefined') user.about = about;
        if (location !== 'undefined') user.location = location;
        if (website !== 'undefined') user.website = website; +
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

        const conversations = await Conversation.find({ members: userId });

        await Promise.all(conversations.map(conversation => {
            return Message.deleteMany({ conversationId: conversation._id, sender: userId });
        }));

        await Conversation.deleteMany({ members: userId }); 

        await BookMark.deleteMany({
            $or: [
                { 'post': { $in: await Post.find({ author: userId }).distinct('_id') } },
                { 'user': userId }
            ]
        });

        await Post.updateMany(
            { 'comments.user': userId },
            { $pull: { 'comments': { 'user': userId } } }
        );

        await Post.deleteMany({ author: userId, })

        await Post.updateMany(
            { 'likes': userId },
            { $pull: { 'likes': userId } }
        );

        await User.updateMany(
            { 'followers': userId },
            { $pull: { 'followers': userId } }
        );

        await User.updateMany(
            { 'following': userId },
            { $pull: { 'following': { $in: [userId] } } }
        );

        await User.findByIdAndDelete(userId);

        return res.status(200).json({ message: 'Account deleted successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsersData, followUser, getSingleUserData, unFollowUser, updateUserProfile, deleteUser }
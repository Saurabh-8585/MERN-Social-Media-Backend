const Post = require('../models/Post')
const User = require('../models/User')
const BookMark = require('../models/BookMark');
const cloudinary = require('../config/cloudinary');
const getDataUri = require('../config/DataUri');


const createPost = async (req, res) => {
    const { content } = req.body;
    const file = req.file;


    const user = await User.findById(req.user);

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    try {
        let postImage = null;
        if (file) {
            const fileUri = getDataUri(file);

            let myCloud = await cloudinary.uploader.upload(fileUri.content, {
                folder: 'Snapia',
            });

            postImage = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        const newPost = new Post({
            content,
            author: user._id,
            postImage
        });

        const savedPost = await newPost.save();

        return res.status(200).json({ message: 'Posted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePost = async (req, res) => {
    const { id } = req.params;
    let user = req.user;
    const isUser = await User.findById(user);

    try {
        if (!isUser) {
            return res.status(401).json({ message: 'User not found' });
        }

        const isPostAvailable = await Post.findById(id);
        if (!isPostAvailable) {
            return res.status(401).json({ message: 'Post not found' });
        }
        if (isPostAvailable.postImage && isPostAvailable.postImage.public_id) {
            await cloudinary.uploader.destroy(isPostAvailable.postImage.public_id);
        }
        await Post.findByIdAndDelete(isPostAvailable._id)
        await BookMark.deleteOne({ post: id })
        return res.status(200).json({ message: 'Post Deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }

}

const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate({
                path: 'author',
                select: '-password -updatedAt -createdAt -email'
            })
            .populate({
                path: 'likes',
                select: '-password -updatedAt -createdAt -email'
            })

            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: '-password -updatedAt -createdAt -email'
                }
            })
            .sort({ createdAt: -1 });

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
const singlePost = async (req, res) => {
    const { id } = req.params;
    try {
        const findPost = await Post.findById(id).populate('author', '-password  -updatedAt -createdAt');
        return res.status(200).json({ post: findPost });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}

const likePost = async (req, res) => {
    const { id } = req.body;
    const user = req.user;
    try {

        const isPostAvailable = await Post.findById(id);
        if (!isPostAvailable) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const isLiked = isPostAvailable.likes.includes(user);
        if (isLiked) {
            return res.status(200).json({ message: 'Post is already liked' });
        }

        isPostAvailable.likes.push(user);
        await isPostAvailable.save();
        return res.status(200).json({ message: 'Added like' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const removeLike = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    try {
        const isPostAvailable = await Post.findById(id);
        if (!isPostAvailable) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const isLiked = isPostAvailable.likes.includes(user);
        if (!isLiked) {
            return res.status(200).json({ message: 'Not liked by you' });
        }
        isPostAvailable.likes = isPostAvailable.likes.filter(userId => userId.toString() !== user.toString());
        await isPostAvailable.save();

        res.status(200).json({ message: 'Like removed successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}













module.exports = { createPost, deletePost, getAllPost, editPost, singleUserPosts, singlePost, likePost, removeLike }
const Post = require('../models/Post')
const User = require('../models/User')
const BookMark = require('../models/BookMark');
const cloudinary = require('../config/cloudinary');
const getDataUri = require('../config/DataUri');
const mongoose = require('mongoose');





const createPost = async (req, res) => {
    const { content, postLocation } = req.body;
    const file = req.file;
    console.log({postLocation});
    const user = await User.findById(req.user);
    try {
        let postImage = null;
        let location = null;
        if (postLocation) {
            location = postLocation
        }
        console.log({location});

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
            postImage,
            location
        });

        await newPost.save();

        return res.status(200).json({ message: 'Posted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const deletePost = async (req, res) => {
    const { id } = req.params;
    const { user } = req;

    try {
        const SelectedPost = await Post.findById(id);
        if (!SelectedPost) {
            return res.status(401).json({ message: 'Post not found' });
        }

        if (SelectedPost.author.toString() !== user) {
            return res.status(401).json({ message: 'Not authorized person to delete post' });
        }

        if (SelectedPost.postImage && SelectedPost.postImage.public_id) {
            await cloudinary.uploader.destroy(SelectedPost.postImage.public_id);
        }
        await Post.findByIdAndDelete(SelectedPost._id)


        await Promise.all([
            Post.findByIdAndDelete(SelectedPost._id),
            BookMark.deleteMany({ post: id }),
        ]);

        return res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};


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
                    path: 'user commentLikes',
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

    const user = req.user;
    try {

        const existingUser = await User.findById(user);
        const existingPost = await Post.findById(postId);

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
        const findUserPosts = await Post.find({ author: id })
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
            }).sort({ createdAt: -1 });;
        return res.status(200).json({ post: findUserPosts });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}
const singlePost = async (req, res) => {
    const { id } = req.params;
    try {
        const findPost = await Post.findById(id)
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

        return res.status(200).json({ post: findPost });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


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


const addComment = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user;

    try {
        const isPostAvailable = await Post.findById(id);
        if (!isPostAvailable) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const newComment = {
            _id: new mongoose.Types.ObjectId(),
            user,
            text: content
        }
        isPostAvailable.comments.push(newComment)
        await isPostAvailable.save();
        return res.status(200).json({ message: 'Comment Added' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const removeComment = async (req, res) => {
    const { PostID, commentId } = req.params;
    const user = req.user;
    try {
        const isPostAvailable = await Post.findById(PostID);
        if (!isPostAvailable) {
            return res.status(404).json({ message: 'Post not found' });
        }
        const comment = isPostAvailable.comments.find(
            (c) => c._id.toString() === commentId
        );
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const isAuthorizedPerson = isPostAvailable.author == user
            || isPostAvailable.comments.find((c) => c.user.toString() === user);

        if (!isAuthorizedPerson) {
            return res.status(404).json({ message: 'Not authorized user' });
        }
        isPostAvailable.comments = isPostAvailable.comments.filter(
            (c) => c._id.toString() !== commentId
        );

        await isPostAvailable.save();


        res.status(200).json({ message: 'Comment removed successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}

const editComment = async (req, res) => {
    const userId = req.user;
    const { PostID, commentId } = req.params;
    const { content } = req.body;
    try {
        const post = await Post.findById(PostID);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);

        if (!comment || comment.user.toString() !== userId) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.text = content;
        await post.save();

        return res.json({ message: 'Comment updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};












module.exports = {
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
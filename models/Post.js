const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        commentLikes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                unique: true
            }
        ]
    },
    { timestamps: true }
);


const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postImage: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true
        }
    ],
    comments: [commentSchema]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post 

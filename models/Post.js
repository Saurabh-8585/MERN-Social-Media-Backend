const mongoose = require('mongoose');
const Comment = require('./Comment');


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
        }
    ],
    comments: [Comment.schema]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post 

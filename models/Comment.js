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
            }
        ]

    },
    { timestamps: true }
);
const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment 
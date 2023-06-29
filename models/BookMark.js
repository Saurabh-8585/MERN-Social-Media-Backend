const mongoose = require('mongoose');

const BookMarkSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true });

const BookMark = mongoose.model('BookMark', BookMarkSchema);
module.exports = BookMark 

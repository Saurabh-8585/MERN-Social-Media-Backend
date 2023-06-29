const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    
    userImage: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true
        }
    ],

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;

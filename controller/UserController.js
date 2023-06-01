const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

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
        res.status(500).json({ message: 'Server error' });
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

module.exports = { checkCurrentUser, deleteUser }
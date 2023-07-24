const express = require('express');
const Conversations = require('../models/Conversation');
const router = express.Router();

router.post('/', async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        const existingConversation = await Conversations.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (existingConversation) {
            return res.status(200).json(existingConversation);
        }

        const newConversation = new Conversations({
            members: [senderId, receiverId]
        });

        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:currentUser/:id', async (req, res) => {
    const { currentUser, id } = req.params;
    try {
        const conversation = await Conversations.find({
            members: { $all: [currentUser, id] }
        });

        if (!conversation || conversation.length === 0) {
            return res.status(404).json({ message: 'No conversation found for this user' });
        }
        res.json(conversation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

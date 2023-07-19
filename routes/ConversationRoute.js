const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const Conversations = require('../models/Conversation');
const router = express.Router();


router.post('/', async (req, res) => {
    const { senderId, receiverId } = req.body;
    const newConversation = new Conversations({
        members: [senderId, receiverId]
    })
    try {
        const savedConversation = await newConversation.save()
        res.status(200).json(newConversation)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        const conversation = await Conversations.find({
            members: { $in: [userId] }
        })
        res.json(conversation)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

module.exports = router;
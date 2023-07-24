const express = require('express');
const authMiddleware = require('../middleware/AuthMiddleware');
const Message = require('../models/Message');
const router = express.Router();


router.post('/', async (req, res) => {
    const { conversationId, sender, text } = req.body.message
    try {
        const newMessage = new Message({conversationId, sender, text})
        const savedMessage = await newMessage.save()
        res.json(savedMessage)
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: 'Server error' });
    }

});

router.get('/conversation/:conversationId', async (req, res) => {
    const { conversationId } = req.params
    try {
        const AllMessages = await Message.find({ conversationId })
        res.send(AllMessages)

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
})

module.exports = router;
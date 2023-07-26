const dotenv = require('dotenv').config();

function checkOrigin(req, res, next) {
    const allowedOrigins = [process.env.FRONTEND_URL, process.env.BACKEND_URL];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.set({
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Credentials': true
        });
        next();
    } else {
        res.status(403).json({ error: 'Forbidden' });
    }
}

module.exports = checkOrigin;

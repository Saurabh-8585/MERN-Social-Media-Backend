const dotenv = require('dotenv').config();
function checkOrigin(req, res, next) {
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL_2,
        process.env.BACKEND_URL,
        'https://accounts.google.com',
        'https://oauth2.googleapis.com',
    ];

    const origin = req.headers.origin;
console.log({origin});
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
        return res.status(403).json({ error: 'Forbidden' });
    }

    next();
}


module.exports = checkOrigin;

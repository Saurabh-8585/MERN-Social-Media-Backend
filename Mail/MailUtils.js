const dotenv = require('dotenv').config();

let config = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
}
const messageInfo = (email, subject, mail) => {
    return {
        from: process.env.EMAIL,
        to: email,
        subject,
        html: mail
    }
}

module.exports = { config, messageInfo }
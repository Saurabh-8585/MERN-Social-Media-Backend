const dotenv = require('dotenv').config();
const Mailgen = require('mailgen');
const nodemailer = require('nodemailer');

let config = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
}

let MailGenerator = new Mailgen({
    theme: {
        customCss: '.body { font-family: Arial, sans-serif; } .footer { text-align: center; }'
    },
    product: {
        name: "Snapia",
        link: process.env.FRONTEND_URL
    }
});

let transporter = nodemailer.createTransport(config);




const generateMail = async ({ emailBody, to, subject }) => {
    try {

        let mail = MailGenerator.generate(emailBody);
        let mailMessage = {
            from: process.env.EMAIL,
            to,
            subject,
            html: mail
        };
        await transporter.sendMail(mailMessage);
    } catch (error) {
        console.log(error);
        throw error;
    }
}
module.exports = { generateMail}
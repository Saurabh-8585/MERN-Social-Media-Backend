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

const resetResponse = (username) => {
    const response = {
        body: {
            name: username,
            intro: 'Password Reset Successful',
            content: 'Your password has been successfully reset. You can now log in using your new password.',
            outro: 'If you did not request a password reset, please contact our support team immediately.',
            signature: 'Best regards,\nSnapia', // Add your custom email signature here
        }
    };
    return response;
}

const forgotPasswordResponse = (username, link) => {
    const response = {
        body: {
            name: username,
            intro: 'Forgot Password Request',
            action: {
                instructions: 'You are receiving this email because you requested a password reset. To reset your password, click the button below:',
                button: {
                    color: '#A855F7',
                    text: 'Reset Your Password',
                    link
                },
            },
            outro: 'If you did not request a password reset, please ignore this email.',
            signature: 'Best regards,\nSnapia Team',
        },
    };
    return response;

}

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
        throw error;
    }
}
module.exports = { generateMail, resetResponse, forgotPasswordResponse, }
const welcomeResponse = (username) => {
    const response = {
        body: {
            name: username,
            intro: '<h1 style="color: #A855F7; font-size: 24px;">Welcome to Our Platform!</h1>',
            content: '<p style="font-size: 16px;">Thank you for joining our platform. We are excited to have you on board and look forward to providing you with a great experience.</p>',
            outro: '<p style="font-size: 16px;">If you have any questions or need assistance, feel free to contact our support team.</p>',
            signature: '<p style="font-size: 16px; margin-top: 20px;">Best regards,<br><strong>Snapia</strong></p>',
        }
    };
    return response;
}
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
const temporaryPasswordResponse = (name, tempPassword) => {
    const response = {
        body: {
            name: name,
            intro: `Your Temporary Password: <b>${tempPassword}</b>`,
            content: 'You are receiving this email because you logged in with your Google account. As this is your first login, we have generated a temporary password for you.',
            outro: 'For security purposes, we recommend that you change this temporary password at your earliest convenience. You can do so by visiting your account settings on Snapia\'s platform.',
            signature: 'Best regards,\nSnapia',
        }
    };
    return response;
};


module.exports = { resetResponse, forgotPasswordResponse, welcomeResponse, temporaryPasswordResponse }
const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendOtpEmail(toEmail, otp) {
        let transporterToUse = this.transporter;

        // If no SMTP_USER is set, we use Ethereal for testing
        if (!process.env.SMTP_USER) {
            console.log("No SMTP_USER configured. Using Ethereal Email for testing.");
            const testAccount = await nodemailer.createTestAccount();
            transporterToUse = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        const mailOptions = {
            from: '"Vidu App" <noreply@viduapp.com>',
            to: toEmail,
            subject: 'Your Registration OTP',
            text: `Your OTP for registration is: ${otp}. It expires in 15 minutes.`,
            html: `<p>Your OTP for registration is: <b>${otp}</b>. It expires in 15 minutes.</p>`
        };

        const info = await transporterToUse.sendMail(mailOptions);

        if (!process.env.SMTP_USER) {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    }
}

module.exports = new EmailService();

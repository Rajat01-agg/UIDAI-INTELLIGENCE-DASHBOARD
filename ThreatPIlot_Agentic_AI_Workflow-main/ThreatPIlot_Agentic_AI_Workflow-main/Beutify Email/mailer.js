import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


if (process.env.NODE_ENV != "production") {
    dotenv.config();
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});


export default async function sendEmail({ to, subject, html }) {
    if (!Array.isArray(to)) to = [to]; // Ensure it's an array
    const sendPromises = to.map((recipient) =>
        transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: recipient,
            subject,
            html,
        })
    );

    return Promise.all(sendPromises);
}


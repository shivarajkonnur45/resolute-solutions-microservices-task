const db = require('../models/index');
const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'zoho',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
    },
});

async function sendEmailAsNotification(req, res) {
    try {
        const mailoption = {
            from: process.env.EMAIL,
            to: userEmail,
            subject: `Email Notification`,
            text: `Mail Check`
        }

        const info = await transporter.sendMail(mailoption);
        res.status(200).json({
            message: "Email Sent"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "There was an error while sending Notification"
        })
    }
}

async function addVisualAsNotification(req, res) {
    try {
        const { userId, notificationTitle, notificationBody } = req.visualNotificationBody;

        await db.visualnotification.create({
            userId: userId,
            notificationTitle: notificationTitle,
            notificationBody: notificationBody
        }); 
    } catch (error) {
        console.log(error);
    }
}

module.exports = { sendEmailAsNotification, addVisualAsNotification };
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const db = require('../models/index');
const Sequelize = require('sequelize');
const notificationBody = require('../notifcationStructure/notificationStruct');
// const { signUpSchema } = require('../helper/validation');

const add_contact = async (req, res, next) => {
    try {
        await db.contactus.create({
            ContactType: req.body.ContactType,
            Email: req.body.Email,
            UserID: req.AccDetails.UserID,
            Message: req.body.Message,
            AccountType: req.AccDetails.AccountType,
            CreatedBy: req.AccDetails.FirstName + ' ' + req.AccDetails.LastName,
            LastModifiedBy: req.AccDetails.FirstName + ' ' + req.AccDetails.LastName
        });

        const userName = req.AccDetails.FirstName;

        // Notification Body >>
        notificationBody.userId = req.AccDetails.UserID;
        notificationBody.notificationTitle = req.body.ContactType == 0 ? 'Connect with Advisor' : req.body.ContactType == 1 ? 'Connect with Client Representative' : 'Feedback Sent';
        notificationBody.emailType = req.body.ContactType == 0 ? 'advisor-feedback' : req.body.ContactType == 1 ? 'customer-support' : 'for-feedback-subscribed'; // here for-feedback is for dummy purpose need to change it
        notificationBody.userEmailReq = req.body.Email;
        notificationBody.userName = userName

        req.visualNotificationBody = notificationBody;
       
        // Notification Body <<

        next();  // Add Notifications to table

        return res.status(200).json({
            message: "Contact form submitted"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! there was server-side error",
            error: error.message
        })
    }
}

module.exports = {
    add_contact
}
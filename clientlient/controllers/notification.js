const db = require('../models/index');
const { Op } = require('sequelize');

async function getAllNotificationForUser(req, res) {
    try {
        const { AccDetails } = req;

        if (!AccDetails || !AccDetails.UserID) {
            return res.status(400).json({
                message: "Invalid Token! Login Again"
            })
        }

        const userId = AccDetails.UserID;

        const allNotifications = await db.visualnotification.findAll({ where: { userId: userId , isSeen: { [Op.ne]: 1 } } });

        return res.status(200).json({
            notificaions: allNotifications
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error while fetching notifications"
        })
    }
}

async function notificationSeen(req, res) {
    try {
        const { AccDetails } = req;

        if (!AccDetails || !AccDetails.UserID) {
            return res.status(400).json({
                message: "Invalid Token! Login Again"
            })
        }

        const userId = AccDetails.UserID;

        const { notificationId } = req.query;
        if (!notificationId) {
            return res.status(404).json({
                message: "Notification not found"
            })
        }

        await db.visualnotification.update({
            isSeen: 1,
            isSeenTime: Date.now()
        }, { where: { notificationId: notificationId, userId: userId } });

        return res.status(200).json({
            message: "Notification marked seen"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Notification remain Unseen"
        })
    }
}

module.exports = { getAllNotificationForUser, notificationSeen };

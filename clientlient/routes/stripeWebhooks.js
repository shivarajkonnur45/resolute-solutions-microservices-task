const express = require('express');
const router = express.Router();

const StripeControler = require('../controllers/StripeController');

const {
    addVisualAsNotification,
    sendEmailAsNotification,
} = require("../middleware/notification.js");


router.post('/s/testing', express.raw({type: "application/json"}), StripeControler.stripeWebhook, sendEmailAsNotification);

module.exports = router;
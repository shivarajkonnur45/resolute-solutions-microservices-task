const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());

const contactusControler = require('../controllers/contactus');
const validateToken = require("../middleware/accountVerify.js");
const validate = require('../middleware/validate.js');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

// Send Notification Middleware
const { addVisualAsNotification, sendEmailAsNotification } = require('../middleware/notification.js');

router.post('/', validateToken, checkUserDeletion, validate('contactusSchema'), contactusControler.add_contact, sendEmailAsNotification);

module.exports = router;
const express = require('express');
const route = express.Router();


//! Testing
route.use(express.json());


//Controllers Exported
const { sendEmailColumns, editEmailContent } = require('../controllers/emailStructure.js');

//Middleware if any
const accountVerify = require('../middleware/accountVerify');
const httpVerify = require('../middleware/httpRequest');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

// Send Notification Middleware
const { addVisualAsNotification } = require('../middleware/notification.js');


//Routing with neccessary routes
route.get('/emailColumns', accountVerify, sendEmailColumns);
route.put('/editEmailColumns', accountVerify, editEmailContent);

//Exported route
module.exports = route;
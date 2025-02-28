const express = require('express');
const route = express.Router();

//! Testing
route.use(express.json());

// Imported Controller 
const { getAllNotificationForUser, notificationSeen } = require('../controllers/notification');

// Middleware (if any)
const accountVerify = require('../middleware/accountVerify');

//Routing with neccessary routes
route.get('/notification', accountVerify, getAllNotificationForUser);
route.post('/notificationSeen', accountVerify, notificationSeen);

//Exported route
module.exports = route;


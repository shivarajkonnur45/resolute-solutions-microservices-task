const express = require('express');
const route = express.Router();

//! Testing
route.use(express.json());

//Controllers Exported
const { addBadgeAchievement, addCourseCertificate } = require('../controllers/addAchievement');
const { getLessonBadges, getCourseCertificate, getCertificate } = require('../controllers/getAchievement');

//Middleware if any
const accountVerify = require('../middleware/accountVerify');
const httpVerify = require('../middleware/httpRequest');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

// Send Notification Middleware
const { addVisualAsNotification } = require('../middleware/notification.js');


//Routing with neccessary routes
route.get('/badgeEvent', httpVerify, addBadgeAchievement); // Http request to set achievement to the user (Badge)
route.get('/badges', accountVerify, checkUserDeletion, getLessonBadges);
route.get('/certificate', accountVerify, checkUserDeletion, getCourseCertificate);
route.get('/courseCertificate', httpVerify, addCourseCertificate); // Http request to set achievement to the user (Certificate)
route.get('/userCertificate', accountVerify, checkUserDeletion, getCertificate);

//Exported route
module.exports = route;
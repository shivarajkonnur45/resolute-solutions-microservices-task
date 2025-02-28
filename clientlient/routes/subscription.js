const express = require('express');
const route = express.Router();

route.use(express.json());

const { getSubscriptionStatus, getSubHttp, plannerAddSubscriptionStatus } = require('../controllers/subscription');
const { getSubscriptionStatusStudent, getPlanByPlanID,cancelSubscriptionStudent } = require("../controllers/StripeController.js");

//Middleware if any
const accountVerify = require('../middleware/accountVerify');
const httpVerify = require('../middleware/httpRequest');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');
const roleChecker = require('../middleware/rolechecker.js');

// Routing with necessary methods
route.get('/subscriptionStatus', accountVerify, checkUserDeletion, getSubscriptionStatus);
route.get('/subStatusParent', accountVerify, checkUserDeletion, plannerAddSubscriptionStatus);
route.get('/subStatusStudent', accountVerify, checkUserDeletion, getSubscriptionStatusStudent);
route.get('/stripeProductById', accountVerify, checkUserDeletion, getPlanByPlanID);
route.get('/subscriptionCancelStudent', accountVerify, checkUserDeletion, cancelSubscriptionStudent);

// Http subscription api
route.get('/httpSubStatus', httpVerify, getSubHttp);

//Exported route
module.exports = route;
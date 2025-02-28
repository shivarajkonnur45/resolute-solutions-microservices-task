const express = require('express');
const route = express.Router();
const { get_admin_report_http } = require('../controllers/ReportController');
const validateToken = require('../middleware/accountVerify');

//Mapping the routes with desired names
route.use('/auth', require('../routes/auth'));
route.use('/student', require('../routes/student'));
route.use('/profile', require('../routes/profile'));
route.use('/help', require('../routes/help'));
route.use('/contactus', require('../routes/contactus'));
route.use('/planner', require('../routes/planner'));
route.use("/course", require('../routes/course'));
route.use('/portfolio', require('../routes/portfolio'));
route.use('/company', require('../routes/company'));
route.use('/parent', require('../routes/parent'));
route.use('/achievement', require('../routes/achievement'));
route.use('/promotion', require('../routes/promotion'));
route.use('/buffer', require('../routes/buffer'));
route.use('/pathway', require('../routes/pathway'));
route.use('/report', validateToken, get_admin_report_http);
route.use('/event', require('../routes/event'));
route.use('/stripe', require('../routes/stripe.js'));
route.use('/stripeWeb', require('../routes/stripeWebhooks.js'));
route.use('/notify', require('../routes/notifications.js'));
route.use('/subscription', require('../routes/subscription.js'));
route.use('/emailStructure', require('../routes/emailstructure.js'));

//Check Email Existing or not
const emailExist = require('../controllers/emailCheck');
const httpVerify = require('../middleware/httpRequest');
const verifyUser = require('../middleware/accountVerify');
const checkIsParent = require('../middleware/verifyParent');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

route.get('/emailUserCheck', httpVerify, emailExist);
route.get('/parentUserCheck', verifyUser, checkUserDeletion, emailExist);




// route.use('/stripe', require('../routes/stripe'));
//Route exported*/
module.exports = route;
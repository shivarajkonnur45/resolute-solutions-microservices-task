const express = require('express');
const router = express.Router();
const Company = require('../sqs/company.js');

//! Testing
router.use(express.json());

const validateToken = require("../middleware/accountVerify.js");
const validateHTTP = require("../middleware/httpRequest.js");
const validate = require('../middleware/validate.js');
const roleChecker = require('../middleware/rolechecker.js');

// Send Notification Middleware
const { addVisualAsNotification, sendEmailAsNotification } = require('../middleware/notification.js');

// normal routes
router.get('/getEmpCount', validateToken, roleChecker(["4"]), Company.getAcceptedMemberList);

// http routes
router.post('/add', validateHTTP, Company.add_company_http, sendEmailAsNotification);
router.put('/update/:UserID', validate('companyUpdateSchema'), validateHTTP, Company.update_company);
router.delete('/delete/:UserID', validateHTTP, Company.delete_company);
router.get('/getCompanyById', validateHTTP, Company.get_company_by_id_http);


module.exports = router;
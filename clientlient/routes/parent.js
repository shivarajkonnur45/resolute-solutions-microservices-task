const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());

const Parent = require('../sqs/parent.js');
const validateToken = require("../middleware/accountVerify.js");
const validateHTTP = require("../middleware/httpRequest.js");
const validate = require('../middleware/validate.js');

const { addParentFromCompany, getParentById, updateParentDataFromCompany, deleteParentFromCompany } = require('../controllers/parent.js');

// Send Notification Middleware
const { addVisualAsNotification, sendEmailAsNotification } = require('../middleware/notification.js');

router.post('/add', validateHTTP, Parent.add_parent_http, sendEmailAsNotification);
router.put('/update/:UserID', validateHTTP, Parent.update_parent_http);
router.delete('/delete/:UserID', validateHTTP, Parent.delete_parent_http);
router.get('/getParentById/:UserID', validateHTTP, Parent.get_parent_by_id_http);

router.post('/add/company', validateToken, addParentFromCompany, sendEmailAsNotification);
router.get('/getParentData/company', validateToken, getParentById);
router.put('/updateParent/company', validateToken, updateParentDataFromCompany);
router.delete('/deleteParent/company', validateToken, deleteParentFromCompany);

module.exports = router;
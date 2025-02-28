const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());

const profileControler = require('../controllers/profile');
const validateToken = require("../middleware/accountVerify.js");
const validateHTTP = require("../middleware/httpRequest.js");
const validate = require('../middleware/validate.js');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

router.get('/', validateToken, checkUserDeletion, profileControler.get_profile);
router.put('/', validateToken, checkUserDeletion, validate('profileUpdateSchema'), profileControler.update_profile);
router.post('/forgotPassword', profileControler.resetPasswordUsers);
router.post('/recoverAccount', validateToken, profileControler.recoverUserAccount);

// Http
router.get('/get-profile-http/:UserID', validateHTTP, profileControler.get_profile_http);
router.get('/get-users', validateHTTP, profileControler.get_http_users);
router.get('/users/setResetPassword', validateHTTP, profileControler.submitResetPasswordRequest);
router.get('/usersByUuid', validateHTTP, profileControler.findUserByUniqueId);
// router.get('/validate-email-http/:Email', validateHTTP, profileControler.validate_email_http);

module.exports = router;
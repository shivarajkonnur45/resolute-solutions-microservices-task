const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());

const authControler = require('../controllers/auth');
const validate = require('../middleware/validate.js');
const { googleAuth, facebookAuth } = require('../controllers/googleAuthenticator.js');
const { emailGenerate, compareOtp } = require('../controllers/emailSignup.js');
const { checkPasswordExistOrNot, signInWithOtpParent, checksignINParentOTP, signInWithGoogleParent, signInWithFacebookParent } = require('../controllers/parentSignIn.js');

router.post('/login', validate('loginSchema'), authControler.login);
router.post('/googleAuth' , googleAuth); // Google Sign Up Authentication
router.post('/facebookAuth', facebookAuth); // Facebook Sign Up Authentication
router.get('/signupMail', emailGenerate); // Signup using mail api
router.post('/otpCompare', compareOtp); // Compare both otp are same or not
router.get('/passwordStatus', checkPasswordExistOrNot); // Check Parent has Password
router.get('/signInOtp', signInWithOtpParent, emailGenerate); // Sign in with Email Api
router.get('/signinOTPCompare', checksignINParentOTP); 
router.get('/signInGoogle', signInWithGoogleParent);
router.get('/signInFacebook', signInWithFacebookParent);

module.exports = router;

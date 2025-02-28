const router = require("express").Router();
const Joi = require("joi");

const { validateRequest } = require("../config/validate-request.js");
const validate = require("../middleware/validate.js");
const LoginController = require("../controllers/LoginController.js");
const accountVerify = require("../middleware/accountVerify"); // Middleware to check the jwt token
const { sendResetPassword } = require("../middleware/notification.js");

router.post(
  "/parent-login",
  validate("loginSchema"),
  LoginController.parentLogin
);
router.get(
  "/resetPassword",
  accountVerify,
  LoginController.passwordResetReqAdmin,
  sendResetPassword
);
router.get("/resetPasswordAdmin", LoginController.resetPasswordAdmin);
router.post("/changePasswordAdmin", LoginController.changePasswordAdmin);

// function LoginValidation(req, res, next) {
//     const schema = Joi.object({
//         Email: Joi.string().max(256),
//         Password: Joi.string().max(512),
//     });
//     validateRequest(req, res, next, schema);
// }

module.exports = router;

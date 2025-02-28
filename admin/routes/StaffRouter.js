const router = require("express").Router();
const Joi = require("joi");

const { validateRequest } = require("../config/validate-request.js");
const AddStaffController = require("../controllers/AddStaffController.js");
const validate = require('../middleware/validate.js');
const validateToken = require("../middleware/accountVerify.js");
const { clientlient } = require('../middleware/sq_request_send.js');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

router.post("/add-parent", validateToken, checkUserDeletion, validate('userSchema'), AddStaffController.parentAdd);
router.post("/add-student", validateToken, checkUserDeletion, validate('userSchema'), AddStaffController.studentAdd, clientlient);
router.post("/add-company", validateToken, checkUserDeletion, validate('userSchema'), AddStaffController.companyAdd);

// function AddValidation(req, res, next) {
//     const schema = Joi.object({
//         FirstName: Joi.string().max(50),
//         LastName: Joi.string().max(50),
//         TeamOrCompanyName: Joi.string().max(256),
//         TeamMember: Joi.number().integer().allow(null),
//         Email: Joi.string().max(256),
//         Password: Joi.string().max(512),
//         PhoneNumber: Joi.string().max(15).allow(null),
//         AccountID: Joi.string().max(15).allow(null),
//         AccountType: Joi.string().max(15).allow(null),
//         Status: Joi.string().max(15).allow(null),
//         IsParticipateCompetitions: Joi.number().integer().valid(0, 1).allow(null),
//         IsNoSuPeAchPoQu: Joi.number().integer().valid(0, 1).allow(null),
//         IsNCourseExNewsProm: Joi.number().integer().valid(0, 1).allow(null),
//         IsLookFeedback: Joi.number().integer().valid(0, 1).allow(null),
//         ParentID: Joi.number().integer().allow(null),
//         IsActive: Joi.number().integer().valid(0, 1).allow(null),
//         StaffPermission: Joi.number().integer().valid(0, 1).allow(null),
//     });
//     validateRequest(req, res, next, schema);
// }

module.exports = router;
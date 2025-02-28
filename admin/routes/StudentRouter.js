const router = require("express").Router();
const path = require("path");
const fs = require("fs");

const StudentController = require("../controllers/StudentController.js");
const validate = require('../middleware/validate.js');
const validateAdminToken = require("../middleware/accountVerify.js");
const validateHTTP = require("../middleware/httpRequest.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

// router.post("/", validateAdminToken, validate('userSchema'), StudentController.add_student);
// router.put("/", validateAdminToken, validate('userUpdateSchema'), StudentController.update_student);
// router.delete("/:StudentID", validateAdminToken, StudentController.delete_student);
// router.get("/:UserID", validateAdminToken, StudentController.get_student);
// router.get('/student_parent/:ParentID', validateAdminToken, StudentController.getStudentForParent);
// router.get("/student-get/:id", validateAdminToken, StudentController.GetStudentRequest);
// router.put("/student-update/:id", validateAdminToken, StudentController.UpdateRequest);
// router.get("/student-competition-get", validateAdminToken, StudentController.GetStudentCompetitionRequest);
// router.post("/student-competition-Participate-add", validateAdminToken, FileUpload, StudentController.AddStudentCompetitionParticipateRequest);
// router.get("/student-competition-Participate-get", validateAdminToken, StudentController.GetStudentCompetitionParticipateRequest);
// router.get("/student-competition-Participates-get", validateAdminToken, StudentController.GetStudentCompetitionParticipatesRequest);



// HTTP REQUEST

router.post("/", validateAdminToken, checkUserDeletion, validate('studentSchema'), StudentController.add_student_http);
router.put("/:UserID", validateAdminToken, checkUserDeletion, validate('studentUpdateSchema'), StudentController.update_student_http);
router.delete("/:UserID", validateAdminToken, checkUserDeletion, StudentController.delete_student_http);
router.get("/:UserID", validateAdminToken, checkUserDeletion, StudentController.get_student_http);
router.get('/student_parent/:ParentID', validateAdminToken, checkUserDeletion, StudentController.get_StudentForParent_http);
router.get('/s/studentOverAllCount', validateAdminToken, checkUserDeletion, StudentController.getOverallUsersCount);

module.exports = router;
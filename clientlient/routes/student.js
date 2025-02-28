const express = require("express");
const router = express.Router();

//! Testing
router.use(express.json());

const studentControler = require("../controllers/student");
const validateToken = require("../middleware/accountVerify.js");
const http_verify = require("../middleware/httpRequest.js");
const validate = require("../middleware/validate.js");
const validateHTTP = require("../middleware/httpRequest.js");
const checkUserDeletion = require("../middleware/userDeletionCheck.js");
const Student = require("../sqs/student.js");
const { checkOneDayCoolDown } = require("../middleware/email.js");

// Send Notification Middleware
const {
    addVisualAsNotification,
    sendEmailAsNotification,
} = require("../middleware/notification.js");

router.post(
    "/",
    validateToken,
    checkUserDeletion,
    // validate("studentSchema"),
    studentControler.addstudent,
    sendEmailAsNotification,
    addVisualAsNotification
);
router.get(
    "/:UserID",
    validateToken,
    checkUserDeletion,
    studentControler.get_student
);
router.get(
    "/",
    validateToken,
    checkUserDeletion,
    studentControler.get_all_student
);
router.put(
    "/:UserID",
    validateToken,
    checkUserDeletion,
    validate("studentUpdateSchema"),
    studentControler.update_student
);
router.delete(
    "/:UserID",
    validateToken,
    checkUserDeletion,
    studentControler.delete_studnet
);
router.get("/p/:ParentID", http_verify, studentControler.getStudentForParent);

router.get(
    "/token/:UserID",
    validateToken,
    checkUserDeletion,
    studentControler.get_student_token
);
router.get(
    "/flow/student",
    validateToken,
    checkUserDeletion,
    studentControler.get_student_flow
);
router.get(
    "/course/student",
    validateToken,
    checkUserDeletion,
    studentControler.get_student_course
);

router.post(
    "/StudentInvite",
    validateToken,
    checkUserDeletion,
    studentControler.StudentInvite
);
router.get(
    "/StudentInvite/StudentInviteList",
    validateToken,
    checkUserDeletion,
    studentControler.StudentInviteList
);
router.get(
    "/StudentInvite/StudentInviteList/:UserID",
    validateToken,
    checkUserDeletion,
    studentControler.StudentInviteByID
);
router.put(
    "/StudentInvite/:UserID",
    validateToken,
    checkUserDeletion,
    studentControler.StudentInviteEdit
);
router.delete(
    "/StudentInvite/StudentInviteList/:UserID",
    validateToken,
    checkUserDeletion,
    studentControler.StudentInvite_delete_studnet
);
router.get(
    "/company/inviteCount",
    validateToken,
    checkUserDeletion,
    studentControler.inviteCount
);
router.post(
    "/StudentInviteResend",
    validateToken,
    checkUserDeletion,
    checkOneDayCoolDown,
    studentControler.StudentInviteResend
);
router.post(
    "/reset/UserPasswordReset",
    studentControler.resetPasswordUser
);

// HTTP REQUEST

router.post(
    "/add",
    validateHTTP,
    Student.add_student_http,
    sendEmailAsNotification,
    addVisualAsNotification
);
router.put("/update/:UserID", validateHTTP, Student.update_student_http);
router.delete("/delete/:UserID", validateHTTP, Student.delete_student_http);
router.get(
    "/getStudentForParent/:ParentID",
    validateHTTP,
    Student.get_studentForParent_http
);
router.get(
    "/getStudentById/:UserID",
    validateHTTP,
    Student.get_student_by_id_http
);

router.get(
    "/reflections/aa",
    validateToken,
    checkUserDeletion,
    Student.get_reflections_http
);
router.get(
    "/studentList/forAdmin",
    validateToken,
    studentControler.get_all_student_admin
);

router.get('/s/studentOverAllCount', validateHTTP, studentControler.studentOverAllCount);

router.get(
    "/resetPasswordStudent/forAdmin",
    validateHTTP,
    studentControler.getUserEmail
);

module.exports = router;

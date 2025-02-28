const express = require("express");
const router = express.Router();

//! Testing
router.use(express.json());

const plannerControler = require("../controllers/planner");
const validateToken = require("../middleware/accountVerify.js");
const http_verify = require("../middleware/httpRequest.js");
const validate = require("../middleware/validate.js");
const checkUserDeletion = require("../middleware/userDeletionCheck.js");
const dateTimeValidatorFlow = require("../middleware/flowChecker.js");

// Send Notification Middleware
const {
  addVisualAsNotification,
  sendEmailAsNotification,
} = require("../middleware/notification.js");

router.post(
  "/",
  validateToken,
  checkUserDeletion,
  validate("flowSchema"),
  dateTimeValidatorFlow,
  plannerControler.add_planner
);
router.get(
  "/:FlowID",
  validateToken,
  checkUserDeletion,
  plannerControler.get_planner
);
router.get(
  "/plan/getAllPlanner",
  validateToken,
  checkUserDeletion,
  plannerControler.get_all_planner
);
router.put(
  "/edit/:FlowID",
  validateToken,
  checkUserDeletion,
  validate("flowSchema"),
  plannerControler.edit_planner
);
router.get(
  "/count/flow",
  validateToken,
  checkUserDeletion,
  plannerControler.get_planner_count
);
router.post(
  "/student/studentAvailability",
  validateToken,
  checkUserDeletion,
  validate("validateStudentAvailable", ["weekData"]),
  plannerControler.checkStudentAvailability
);

router.get("/flowData/getFlowStatus", validateToken, checkUserDeletion, plannerControler.getPlannerForUpdate);

router.get("/configurePlan/Student", validateToken, checkUserDeletion, plannerControler.checkWeeklyStreamingTime);

router.get("/weeklyPlan/Student", validateToken, checkUserDeletion, plannerControler.getPlannerForWeeklyView);
router.get("/weeklyPlanOverView/Student", validateToken, checkUserDeletion, plannerControler.getPlannerForWeeklyOverview);
router.get("/coursePlannerDataByCourseId/Student", validateToken, checkUserDeletion, plannerControler.getPlannerFromCourseIdBtwTime);
router.get("/canStartStream/Student", validateToken, checkUserDeletion, plannerControler.validateForStreamTime);
// router.get('/getCourse/:Course', http_verify, plannerControler.get_coursedata_http);
// router.get('/', validateToken, studentControler.get_all_student);
// router.put('/:UserID', validateToken, studentControler.update_student);
// router.delete('/:UserID', validateToken, studentControler.delete_studnet);

// HTTP REQUEST
router.get("/", http_verify, plannerControler.get_all_planner);
router.get(
  "/getcoursedata/:id",
  http_verify,
  plannerControler.get_coursedata_http
);

//! Get Grade Flow
router.get(
  "/flowData/getFlowGrade",
  http_verify,
  plannerControler.getFlowGradeHttp
);

router.get(
  "/getFlow/Student",
  http_verify,
  plannerControler.getPlannerForStudent
);

module.exports = router;

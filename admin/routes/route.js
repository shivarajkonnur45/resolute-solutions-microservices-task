const express = require("express");
const route = express.Router();
const validateAdminToken = require("../middleware/accountVerify.js");
const validate = require("../middleware/validate.js");

//api to populate data
const { AddStaff } = require("../controllers/adminLogin");
const { createUser } = require("../controllers/adminLogin");
const { ViewStaffByID } = require("../controllers/adminLogin");
const { ViewStaff } = require("../controllers/adminLogin");
const { UpdateStaff } = require("../controllers/adminLogin");
const { deleteStaff, recoverUserAccount } = require("../controllers/adminLogin");

//Actual Login APIs
// const getLogin = require('../controllers/adminRealLogin');

// Send Notification Middleware
const { addVisualAsNotification } = require("../middleware/notification.js");

//! Staff and Admin Login
const getStaffAdmin = require("../controllers/adminStaffLogin");
const existenceCheck = require("../controllers/login");

//! User and Parent Login

const userEmail = require("../controllers/userEmail");
const userLogin = require("../controllers/userLogin");

//Routes mapping

//! Populating Route { User }
// route.post('/signupUser', createUser);

//! Admin and Staff Mapping {LOGIN}

route.post("/login", existenceCheck, getStaffAdmin);

// User LOgin & SignUp

route.use("/addStaff", require("./StaffRouter"));

//! User and Parent Mapping {LOGIN}
route.post("/loginuser", userEmail, userLogin);

// Student Route
route.use("/student", require("./StudentRouter"));

// Reflections Route
route.use("/reflection", require("./ReflectionsRouter"));

// Help Route
route.use("/help", require("./HelpRouter"));

// Competition Route
route.use("/competition", require("./CompetitionRouter"));

// Promotion Route
route.use("/promotion", require("./PromotionRouter"));

// Company Route
route.use("/company", require("./CompanyRouter"));

// Parent Route
route.use("/parent", require("./ParentRouter.js"));

// Dashboard Route
route.use("/dashboard", require("./dashboard.js"));

// Report Route
route.use("/report", require("./report.js"));

// Login Action Related Route
route.use("/usersLogin", require("./LoginRouter.js"));

//! Middlewares ---START--->
const accountVerify = require("../middleware/accountVerify"); // Middleware to check the jwt token
const adminProtected = require("../middleware/adminProtected"); // Middleware to check if the user is admin
const httpVerify = require("../middleware/httpRequest.js"); // Http check middleware
const checkUserDeletion = require("../middleware/userDeletionCheck.js"); // Middleware to check user is deleted or not
const {
  subscriptionCheck,
  freeVideos,
  plannerTimeCheck,
} = require("../middleware/subscriptionCheck.js"); // Check if the student have valid subscription
//! Middlewares -----END--->

//! Courses Routing Starts here <<
const {
  addCourse,
  Categorycheck,
  uploadCoursefiles,
} = require("../controllers/addCourse");
const { lessonsUpload, addLessons } = require("../controllers/addLessons");
const {
  getCourseData,
  getCourseCategoryByID,
  getAllCourseDataByID,
  getAllCourseDataByID_http,
  getCourseDataBySingleId,
  getOnlyCourse,
  getCatgeoryQuery,
  getCertificateImage,
  getLessonBadgeImage,
  getTitleCourseTrophy,
} = require("../controllers/courseDataGet");
const {
  getCourseByGrade,
  getCourseByID,
  getCourseModuleLessonLength,
  getLessonBadgeLength,
  getCourseCertificateTitle,
} = require("../controllers/getCourseById.js");
const {
  editCourse,
  editCoursefiles,
  editCategory,
  deletePrevious,
} = require("../controllers/editCourse.js");
const {
  deletePreviousLessonsFiles,
  editLessonfiles,
  editLesson,
} = require("../controllers/editLessons.js");
const {
  getLessonVideoUrlByIdHttp,
  getLessonTranscriptByIdHttp,
} = require("../controllers/getLesson.js");
// const courseDataValidation = require('../middleware/requestValidators');

//Course Pathway
const {
  addPathway,
  uploadPathway,
  CategorycheckPath,
} = require("../controllers/addPathway");
const {
  getPathwayById,
  pathwayEdit,
  pathwayGetByIdHttp,
  getPathwayByIDs,
} = require("../controllers/pathwayGet.js");
const {
  deletePreviousPathwayFiles,
  findorCreatePathwayCategory,
  uploadPathwayFiles,
  editPathway,
} = require("../controllers/editPathway.js");
const quizCount = require("../controllers/getQuiz.js");

//Categories
const allCategories = require("../controllers/getallCategories");
const router = require("./StaffRouter");
route.get("/allCategories", accountVerify, allCategories);

//Add Course
route.post(
  "/addCourse",
  accountVerify,
  adminProtected,
  checkUserDeletion,
  uploadCoursefiles,
  Categorycheck,
  addCourse
); //! -> Maintain (Done)
route.post("/addPathway", uploadPathway, CategorycheckPath, addPathway);
route.post(
  "/addLesson",
  accountVerify,
  checkUserDeletion,
  lessonsUpload,
  addLessons
); //! -> Maintain (Done)

//Get Course
route.get(
  "/getCourseData",
  accountVerify,
  checkUserDeletion,
  getCourseCategoryByID,
  getCourseData
); //! --> Pending Test
route.get(
  "/course/:courseID?",
  accountVerify,
  checkUserDeletion,
  getCourseByID
);
route.get("/coursebygrade/:CourseGrade?/:Page?", httpVerify, getCourseByGrade);
// route.get('/courseGradeHttp', httpVerify,)
route.get("/courseData", httpVerify, getAllCourseDataByID);
route.get("/courseDataHttp/:courseIDs", httpVerify, getAllCourseDataByID_http);
route.get("/courseGetID/:CourseId?", httpVerify, getCourseDataBySingleId);
route.get("/forCourse", accountVerify, getCatgeoryQuery, getOnlyCourse);
route.get("/courseVideoNumbers", httpVerify, getCourseModuleLessonLength);
route.get("/lessonBadgeLength", httpVerify, getLessonBadgeLength);
route.get("/certificateImage", httpVerify, getCertificateImage);
route.get("/lessonBadgeImage", httpVerify, getLessonBadgeImage);
route.get("/courseTrophyTitle", httpVerify, getTitleCourseTrophy);
route.get("/courseCertificateTitle", httpVerify, getCourseCertificateTitle);
route.get("/lessonUrlById", httpVerify, getLessonVideoUrlByIdHttp);
route.get("/lessonTranscriptById", httpVerify, getLessonTranscriptByIdHttp);
route.get("/lessonQuizCount", httpVerify, quizCount);

//Edit Course & Lessons
route.put(
  "/editCourse/:courseID",
  accountVerify,
  adminProtected,
  checkUserDeletion,
  deletePrevious,
  editCoursefiles,
  editCategory,
  editCourse
);
route.put(
  "/editLesson/:lessonID",
  accountVerify,
  adminProtected,
  checkUserDeletion,
  deletePreviousLessonsFiles,
  editLessonfiles,
  editLesson
); // <----- Working here

//! Delete Course/Module/Lessons --Starts-->>
const {
  deleteLessons,
  deleteLessonsParts,
  deleteModule,
  deleteFullCourse,
} = require("../controllers/deleteforAll.js");

route.put(
  "/deleteLessons/:LessonID",
  accountVerify,
  adminProtected,
  checkUserDeletion,
  deleteLessons
);
route.put(
  "/deleteLessonParts",
  accountVerify,
  adminProtected,
  checkUserDeletion,
  deleteLessonsParts
);
route.put(
  "/deleteModule/:ModuleID",
  accountVerify,
  adminProtected,
  checkUserDeletion,
  deleteModule
);
route.put(
  "/deleteCourse/:CourseID",
  accountVerify,
  adminProtected,
  checkUserDeletion,
  deleteFullCourse
);

//! Delete Course/Module/Lessons --Ends-->>

//Pathway Mapping
route.get(
  "/pathway/:PathwayID",
  accountVerify,
  checkUserDeletion,
  getPathwayById
);
route.put(
  "/updatePathway/:PathwayID",
  accountVerify,
  checkUserDeletion,
  deletePreviousPathwayFiles,
  findorCreatePathwayCategory,
  uploadPathwayFiles,
  editPathway
); //! Pathway Edit Working (Test - Pending)
route.get("/pathwayGetHttp", httpVerify, pathwayGetByIdHttp);
route.get("/pathwayByIDs", httpVerify, getPathwayByIDs);

//! Courses Routing Ends here >>

//! Router for account get http ---STARTS--->
//import
const mergeUser = require("../controllers/mergeUser.js");
route.get("/getUsers", accountVerify, checkUserDeletion, mergeUser);
//! Router for account get http ---ENDS--->

//!Existing Email Check
const {
  checkAdminEmail,
  checkUserEmail,
  checkForAdminMailFromAdminSide,
  checkAdminEmailHttp,
} = require("../controllers/existUser.js");
route.post("/existEmail", accountVerify, checkUserDeletion, checkAdminEmail);
route.get("/emailCheckAdmin", httpVerify, checkAdminEmailHttp);
route.post("/http_user_Email", checkUserEmail);

//Course Router
// route.use('/Course', require('./CourseRouter'));
//! Video Player
const {
  videoPlay,
  getVideoLengthForUser,
} = require("../controllers/videoBuffering.js");

route.get("/playVideo", subscriptionCheck, videoPlay); // This video play url for subscription needed videos //! Removing time check here is the middle ware for it (plannerTimeCheck)
route.get("/freePlay", freeVideos, videoPlay); // This video play url for "not" subscription needed videos
route.get("/getVideoLength", httpVerify, getVideoLengthForUser);
//! Video Player ---END--->>

//! OCR Portfolio
const {
  getImageText,
  calculateScore,
} = require("../controllers/portfolioOCR.js");

route.post(
  "/portfolioScore",
  accountVerify,
  adminProtected,
  checkUserDeletion,
  getImageText,
  calculateScore
);
//! OCR Portfolio ---END--->>

//! Quiz Score for Progress -- >>
const getQuizScore = require("../controllers/getQuizScore.js");

route.post("/getQuizScore", accountVerify, getQuizScore);
//! Quiz Score for Progress --Ends-->>

//! Generate Certificate Image
const generateCertificate = require("../controllers/generateCertificate.js");
route.get("/generateCertificate", httpVerify, generateCertificate);

const { isInterestedCourse, getInterestedCourseListParent, getInterestedListAdmin } = require("../controllers/ParentController.js");

route.post("/markMeInterested", accountVerify, isInterestedCourse);
route.get("/getMeInterested", accountVerify, getInterestedCourseListParent);
route.get("/getAdminInterested", accountVerify, getInterestedListAdmin);


//! Populating Route { Admin } //
route.post(
  "/staff",
  checkForAdminMailFromAdminSide,
  validate("adminSchema"),
  AddStaff,
  addVisualAsNotification
);
route.get("/staff", validateAdminToken, ViewStaff);
route.get("/staff/:id", validateAdminToken, ViewStaffByID);
route.put(
  "/staff/:id",
  validateAdminToken,
  validate("adminUpdateSchema"),
  UpdateStaff
);
route.delete("/staff/:id", validateAdminToken, deleteStaff);

route.post("/recoverUserAccount", validateAdminToken, recoverUserAccount);

//Route exported
module.exports = route;

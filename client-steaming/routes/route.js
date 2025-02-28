const express = require('express');
const route = express.Router();

//! Controllers imported
const { courseVideoTrack, getVideoProgressForUser, getProgressForAllVideos } = require('../controllers/videoStreaming');
const { getCourseCompeletionStatus, getLessonCompletionStatus, getAllUncompletedVideos, getLatestCourseCompleted, getLessonLatestData, isStreamedToday, getAllLessonCompletionByCourseId } = require('../controllers/getCompletionStatus.js');
const getQuizScore = require('../controllers/setQuizScore.js');
// const { courseStatusStudent } = require('../controllers/courseStatus.js');

//! ----->

//! Middlewares if any
const accountVerify = require('../middleware/accountVerify');
const watchTimeValidate = require('../middleware/watchTimeAuthenticator');
const validateHTTP = require("../middleware/httpRequest.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

//! Main middleware to check for subscriptions
const checkUserSubscription = require('../middleware/subscriptionCheck.js');

//! ----->

//! Stream Time store & Progress Controller
route.post('/watchTime', accountVerify, checkUserDeletion, watchTimeValidate, courseVideoTrack); // here watchTimeValidate stores current irrespective of how much time watched and courseVideoTrack tracks the maximum time watched
route.get('/getProgress', accountVerify, checkUserDeletion, getVideoProgressForUser);
// route.get('/getStudentProgress', accountVerify, checkUserDeletion, courseStatusStudent);

route.get('/getAllVideoUpdate', accountVerify, checkUserDeletion, getProgressForAllVideos);
route.get('/getLessonCompletion', accountVerify, checkUserDeletion, getAllLessonCompletionByCourseId);

route.get('/lesson-http-progress', validateHTTP, getLessonCompletionStatus);
route.get('/course-http-progress', validateHTTP, getCourseCompeletionStatus);
route.get('/quiz-http-score', validateHTTP, getQuizScore);
route.get('/uncompletedCourse', validateHTTP, getAllUncompletedVideos);
route.get('/latestCourse', validateHTTP, getLatestCourseCompleted);
route.get('/latestLesson', validateHTTP, getLessonLatestData);
route.get('/isStreamedToday', validateHTTP, isStreamedToday);


//! ----->

//! Routes Imported
module.exports = route;
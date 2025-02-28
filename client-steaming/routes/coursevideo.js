const express = require('express');
const router = express.Router();
const CourseControler = require('../controllers/coursevideo');
const validateHTTP = require("../middleware/httpRequest.js");
// const validateToken = require("../middleware/accountVerify.js");
// const validate = require('../middleware/validate.js');

//1 Course
router.get('/get-coursevideo-http',validateHTTP, CourseControler.get_course_video_http);
router.get('/post-coursevideo-http',validateHTTP, CourseControler.post_course_video_http);

//2 Lesson
router.get('/get-lessonvideo-http',validateHTTP, CourseControler.get_lessonvideo_http);
router.get('/post-lessonvideo-http',validateHTTP, CourseControler.post_lessonvideo_http);

//3 Lesson Quiz
router.get('/get-lesson-quiz-http',validateHTTP, CourseControler.get_lesson_quiz_http);
router.get('/post-lesson-quiz-http',validateHTTP, CourseControler.post_lesson_quiz_http);

//4 Badge
router.get('/get-lesson-badge-http',validateHTTP, CourseControler.get_lesson_badge_http);
router.get('/post-lesson-badge-http',validateHTTP, CourseControler.post_lesson_badge_http);

//5 certificate
router.get('/get-certificate-http',validateHTTP, CourseControler.get_certificate_http);
router.get('/post-certificate-http',validateHTTP, CourseControler.post_certificate_http);

module.exports = router;
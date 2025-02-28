const express = require('express');
const router = express.Router();
const BufferControler = require('../controllers/bufferController.js');
const validateToken = require("../middleware/accountVerify.js");
const http_verify = require('../middleware/httpRequest.js');
const validate = require('../middleware/validate.js');

//! Testing
router.use(express.json());

router.get('/coursevideo', http_verify, BufferControler.CourseVideoByID);
router.post('/coursevideo', http_verify, BufferControler.CourseVideoPost);

router.get('/courseLessonvideo', http_verify, BufferControler.CourseLessonVideoByID);
router.post('/courseLessonvideo', http_verify, BufferControler.CourseLessonVideoPost);

router.get('/LessonQuiz', http_verify, BufferControler.LessonQuizByID);
router.post('/LessonQuiz', http_verify, BufferControler.LessonQuizPost);

router.get('/Badge', http_verify, BufferControler.BadgeByID);
router.post('/Badge', http_verify, BufferControler.BadgePost);

module.exports = router;
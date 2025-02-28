const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());


const { getCourseForStudent, getCourseByID, getCourseForParent } = require('../controllers/course');

//Middlewares
const accountVerify = require('../middleware/accountVerify');

router.get('/grade/:StudentId?/:gradeArray?/:Page?', getCourseForParent);
router.get('/courseFor/:CourseId?' , getCourseByID);
router.get('/courseDataStudent', accountVerify, getCourseForStudent);
//router.post('/coursevideo', CourseVideoByID);

module.exports = router;
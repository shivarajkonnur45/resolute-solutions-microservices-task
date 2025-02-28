const axios = require('axios');
const db = require('../models/index');
const { Op } = require("sequelize");

const CourseVideoByID = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(
            `${process.env.HTTP_REQUEST_CLIENT_STREAM}/coursevideo/get-coursevideo-http?UserID=${req.query.UserID}&VideoName=${req.query.VideoName}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );
        if (response) {
            return res.status(200).json(response.data);
        } else {
            return res.status(400).json({
                message: "Record not found!"
            });
        }
    } catch (error) {
        //console.error("Error fetching course video:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the course video.",
            error: error.message
        });
    }
};




const CourseVideoPost = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(`${process.env.HTTP_REQUEST_CLIENT_STREAM}/coursevideo/post-coursevideo-http?UserID=${req.body.UserID}&VideoName=${req.body.VideoName}&BufferTime=${req.body.BufferTime}&TrophyImageName=${req.body.TrophyImageName}&Status=${req.body.Status}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        if (response) { return res.status(200).json(response.data);} 
        else {
            return res.status(400).json({
                message: "Record not found!"
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while fetching the course video.",
            error: error.message
        });
    }
};


const CourseLessonVideoByID = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(
            `${process.env.HTTP_REQUEST_CLIENT_STREAM}/coursevideo/get-lessonvideo-http?UserID=${req.query.UserID}&LessonVideoName=${req.query.LessonVideoName}&ModuleID=${req.query.ModuleID}&LessonID=${req.query.LessonID}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );
        if (response) {
            return res.status(200).json(response.data);
        } else {
            return res.status(400).json({
                message: "Record not found!"
            });
        }
    } catch (error) {
        //console.error("Error fetching course lesson video:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the course lesson video.",
            error: error.message
        });
    }
};


const CourseLessonVideoPost = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(`${process.env.HTTP_REQUEST_CLIENT_STREAM}/coursevideo/post-lessonvideo-http?CourseVideoID=${req.body.CourseVideoID}&ModuleID=${req.body.ModuleID}&LessonID=${req.body.LessonID}&UserID=${req.body.UserID}&LessonVideoName=${req.body.LessonVideoName}&BufferTime=${req.body.BufferTime}&Status=${req.body.Status}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        if (response) { return res.status(200).json(response.data);} 
        else {
            return res.status(400).json({
                message: "Record not found!"
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while fetching the lesson video.",
            error: error.message
        });
    }
};

const LessonQuizByID = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(
            `${process.env.HTTP_REQUEST_CLIENT_STREAM}/coursevideo/get-lesson-quiz-http?UserID=${req.query.UserID}&CourseID=${req.query.CourseID}&ModuleID=${req.query.ModuleID}&LessonID=${req.query.LessonID}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );
        if (response) {
            return res.status(200).json(response.data);
        } else {
            return res.status(400).json({
                message: "Record not found!"
            });
        }
    } catch (error) {
        //console.error("Error fetching course video:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the course video.",
            error: error.message
        });
    }
};


const LessonQuizPost = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(`${process.env.HTTP_REQUEST_CLIENT_STREAM}/coursevideo/post-lesson-quiz-http?UserID=${req.body.UserID}&LessonID=${req.body.LessonID}&ModuleID=${req.body.ModuleID}&CourseID=${req.body.CourseID}&RightAnswer=${req.body.RightAnswer}&QuizFormat=${req.body.QuizFormat}&Question=${req.body.Question}&Answers=${req.body.Answers}&Position=${req.body.Position}&Status=${req.body.Status}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        if (response) { return res.status(200).json(response.data);} 
        else {
            return res.status(400).json({
                message: "Record not found!"
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while fetching the lesson quiz.",
            error: error.message
        });
    }
};

const BadgeByID = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(
            `${process.env.HTTP_REQUEST_CLIENT_STREAM}/coursevideo/get-lesson-badge-http?UserID=${req.query.UserID}&CourseID=${req.query.CourseID}&ModuleID=${req.query.ModuleID}&LessonID=${req.query.LessonID}`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );
        if (response) {
            return res.status(200).json(response.data);
        } else {
            return res.status(400).json({
                message: "Record not found!"
            });
        }
    } catch (error) {
        //console.error("Error fetching course video:", error);
        return res.status(500).json({
            message: "An error occurred while fetching the course video.",
            error: error.message
        });
    }
};

const BadgePost = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(`${process.env.HTTP_REQUEST_CLIENT_STREAM}/coursevideo/post-lesson-badge-http?UserID=${req.query.UserID}&CourseID=${req.query.CourseID}&ModuleID=${req.query.ModuleID}&LessonID=${req.query.LessonID}&Title =${req.query.Title }&Description =${req.query.Description }&LessonBadgeImage =${req.query.LessonBadgeImage }`,
            {
                headers: { "Authorization": `Bearer ${token}` }
            }
        );

        if (response) { return res.status(200).json(response.data);} 
        else {
            return res.status(400).json({
                message: "Record not found!"
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "An error occurred while fetching the lesson quiz.",
            error: error.message
        });
    }
};

module.exports = {
    CourseVideoByID, 
    CourseVideoPost, 
    CourseLessonVideoByID, 
    CourseLessonVideoPost, 
    LessonQuizByID,
    LessonQuizPost,
    BadgeByID,
    BadgePost
};
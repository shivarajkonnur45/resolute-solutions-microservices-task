const jwt = require('jsonwebtoken');
const db = require('../models/index');
const Sequelize = require('sequelize');

//1 ---------------Add course--------------------//
const post_course_video_http = async (req, res) => {
    try {
        const CourseVideoData = await db.CourseVideo.create({
            UserID: req.query.UserID,
            VideoName: req.query.VideoName,
            BufferTime: req.query.BufferTime,
            Status: req.query.Status
        });
        if (!CourseVideoData) { return res.status(404).json({ message: "Course not found" });}

        if(req.query.Status == 1){
            const CourseDataExist = await db.CourseVideoTrophy.findOne({
                where: {
                    UserID: req.query.UserID,
                    VideoName: req.query.VideoName
                }
            });
            if(CourseDataExist){
                return res.status(400).json({ message: "Course trophy alredy exist!"});
            }

            const Data = CourseVideoData.dataValues;
            const CourseVideoTrophyData = await db.CourseVideoTrophy.create({
                CourseVideoID : Data.CourseVideoID,
                UserID: Data.UserID,
                VideoName: Data.VideoName,
                TrophyImageName: req.query.TrophyImageName
            });
            if (!CourseVideoTrophyData) { return res.status(404).json({ message: "Course not found" });}
        }
        
        res.status(200).json({ message: "Course addedd successfully"});
    } catch (error) {
        res.status(500).json({message: "Failed to add Course",error: error.message});
    }
}

//2 ---------------Get Course --------------------//
const get_course_video_http = async (req, res) => {
    try {
        const userExist = await db.CourseVideo.findOne({
            where: {
                UserID: req.query.UserID,
                VideoName: req.query.VideoName
            },
            order: [['CourseVideoID', 'DESC']] 
        });

        if (!userExist) {
            return res.status(404).json({ message: "Course not found" });
        }

        const TrophyData = await db.CourseVideoTrophy.findOne({
            where: {
                UserID: req.query.UserID,
                VideoName: req.query.VideoName
            },
            order: [['CourseVideoID', 'DESC']] 
        });


        res.status(200).json({ message: "Course Data", data: userExist, trophy:TrophyData });
    } catch (error) {
        console.error("Error fetching course video:", error);
        res.status(500).json({ message: "Sorry! There was a server-side error", error: error.message });
    }
}



//3 ---------------Get Lesson --------------------//
const get_lessonvideo_http = async (req, res) => {
    try {
        const LessonData = await db.ModuleBaseLesson.findOne({
            where: {
                UserID: req.query.UserID,
                LessonVideoName: req.query.LessonVideoName,
                ModuleID: req.query.ModuleID,
                LessonID: req.query.LessonID
            },
            order: [['ModuleBaseLessonID', 'DESC']] 
        });
        if (!LessonData) { return res.status(404).json({ message: "Course not found" });}
        // const TrophyData = await db.CourseVideoTrophy.findOne({
        //     where: {
        //         UserID: req.query.UserID,
        //         VideoName: req.query.VideoName
        //     },
        //     order: [['CourseVideoID', 'DESC']] 
        // });
        res.status(200).json({ message: "Lesson Data", data: LessonData});
    } catch (error) {
        console.error("Error fetching course video:", error);
        res.status(500).json({ message: "Sorry! There was a server-side error", error: error.message });
    }
}

//4 ---------------Post Lesson --------------------//
const post_lessonvideo_http = async (req, res) => {
    try {
        // const CourseDataExist = await db.ModuleBaseLesson.findOne({
        //     where: {
        //         CourseVideoID: req.query.CourseVideoID,
        //         ModuleID : req.query.ModuleID,
        //         LessonID : req.query.LessonID,
        //         UserID : req.query.UserID,
        //         Status: 0
        //     },
        //     order: [['ModuleBaseLessonID', 'DESC']] 
        // });
        // if(CourseDataExist){
        //     return res.status(400).json({ message: "Course trophy alredy exist!"});
        // }
        const ModuleBaseVideoData = await db.ModuleBaseLesson.create({
            CourseVideoID: req.query.CourseVideoID,
            ModuleID : req.query.ModuleID,
            LessonID : req.query.LessonID,
            UserID : req.query.UserID,
            LessonVideoName :req.query.LessonVideoName,
            BufferTime: req.query.BufferTime,
            Status: req.query.Status
        });
        if (!ModuleBaseVideoData) { return res.status(404).json({ message: "Lesson not found" });}

        // if(req.query.Status == 1){
        //     const CourseDataExist = await db.CourseVideoTrophy.findOne({
        //         where: {
        //             UserID: req.query.UserID,
        //             VideoName: req.query.VideoName
        //         }
        //     });
        //     if(CourseDataExist){
        //         return res.status(400).json({ message: "Course trophy alredy exist!"});
        //     }

        //     const Data = ModuleBaseVideoData.dataValues;
        //     const CourseVideoTrophyData = await db.CourseVideoTrophy.create({
        //         CourseVideoID : Data.CourseVideoID,
        //         UserID: Data.UserID,
        //         VideoName: Data.VideoName,
        //         TrophyImageName: req.query.TrophyImageName
        //     });
        //     if (!CourseVideoTrophyData) { return res.status(404).json({ message: "Course not found" });}
        // }
        
        res.status(200).json({ message: "Lesson addedd successfully"});
    } catch (error) {
        res.status(500).json({message: "Failed to add Lesson",error: error.message});
    }
}

//5 ---------------Get quiz --------------------//
const get_lesson_quiz_http = async (req, res) => {
    try {
        const LessonData = await db.LessonQuiz.findOne({
            where: {
                UserID: req.query.UserID,
                CourseID: req.query.CourseID,
                ModuleID: req.query.ModuleID,
                LessonID: req.query.LessonID
            },
            order: [['LessonQuizID', 'DESC']] 
        });
        if (!LessonData) { return res.status(404).json({ message: "Course not found" });}
        // const TrophyData = await db.CourseVideoTrophy.findOne({
        //     where: {
        //         UserID: req.query.UserID,
        //         VideoName: req.query.VideoName
        //     },
        //     order: [['CourseVideoID', 'DESC']] 
        // });
        res.status(200).json({ message: "Lesson Quiz Data", data: LessonData});
    } catch (error) {
        console.error("Error fetching course video:", error);
        res.status(500).json({ message: "Sorry! There was a server-side error", error: error.message });
    }
}

//6 ---------------Post Lesson --------------------//
const post_lesson_quiz_http = async (req, res) => {
    try {
        const LessonQuiz = await db.LessonQuiz.create({
            UserID: req.query.UserID,
            LessonID: req.query.LessonID,
            ModuleID : req.query.ModuleID,
            CourseID : req.query.CourseID,
            RightAnswer : req.query.RightAnswer,
            QuizFormat :req.query.QuizFormat,
            Question: req.query.Question,
            Answers: req.query.Answers,
            Position: req.query.Position,
            Status: req.query.Status
        });
        if (!LessonQuiz) { return res.status(404).json({ message: "Lesson not found" });}

        // if(req.query.Status == 1){
        //     const CourseDataExist = await db.CourseVideoTrophy.findOne({
        //         where: {
        //             UserID: req.query.UserID,
        //             VideoName: req.query.VideoName
        //         }
        //     });
        //     if(CourseDataExist){
        //         return res.status(400).json({ message: "Course trophy alredy exist!"});
        //     }

        //     const Data = LessonQuiz.dataValues;
        //     const CourseVideoTrophyData = await db.CourseVideoTrophy.create({
        //         CourseVideoID : Data.CourseVideoID,
        //         UserID: Data.UserID,
        //         VideoName: Data.VideoName,
        //         TrophyImageName: req.query.TrophyImageName
        //     });
        //     if (!CourseVideoTrophyData) { return res.status(404).json({ message: "Course not found" });}
        // }
        
        res.status(200).json({ message: "Lesson addedd successfully"});
    } catch (error) {
        res.status(500).json({message: "Failed to add Lesson",error: error});
    }
}

//7 ---------------Get quiz --------------------//
const get_lesson_badge_http = async (req, res) => {
    try {
        const LessonData = await db.LessonBadge.findOne({
            where: {
                UserID: req.query.UserID,
                CourseID: req.query.CourseID,
                ModuleID: req.query.ModuleID,
                LessonID: req.query.LessonID
            },
            order: [['LessonBadgeID', 'DESC']] 
        });
        if (!LessonData) { return res.status(404).json({ message: "Course not found" });}
        res.status(200).json({ message: "Lesson badge data", data: LessonData});
    } catch (error) {
        console.error("Error fetching course video:", error);
        res.status(500).json({ message: "Sorry! There was a server-side error", error: error.message });
    }
}

//8 ---------------Post quiz--------------------//
const post_lesson_badge_http = async (req, res) => {
    try {
        const LessonBadge = await db.LessonBadge.create({
            UserID: req.query.UserID,
            LessonID: req.query.LessonID,
            ModuleID: req.query.ModuleID,
            CourseID: req.query.CourseID,
            Title: req.query.Title,
            Description: req.query.Description,
            LessonBadgeImage: req.query. LessonBadgeImage,
        });
        if (!LessonBadge) { return res.status(404).json({ message: "Lesson not found" });}

        // if(req.query.Status == 1){
        //     const CourseDataExist = await db.CourseVideoTrophy.findOne({
        //         where: {
        //             UserID: req.query.UserID,
        //             VideoName: req.query.VideoName
        //         }
        //     });
        //     if(CourseDataExist){
        //         return res.status(400).json({ message: "Course trophy alredy exist!"});
        //     }

        //     const Data = LessonQuiz.dataValues;
        //     const CourseVideoTrophyData = await db.CourseVideoTrophy.create({
        //         CourseVideoID : Data.CourseVideoID,
        //         UserID: Data.UserID,
        //         VideoName: Data.VideoName,
        //         TrophyImageName: req.query.TrophyImageName
        //     });
        //     if (!CourseVideoTrophyData) { return res.status(404).json({ message: "Course not found" });}
        // }
        
        res.status(200).json({ message: "Lesson addedd successfully"});
    } catch (error) {
        res.status(500).json({message: "Failed to add Lesson",error: error});
    }
}

//9 ---------------Get Certificate --------------------//
const get_certificate_http = async (req, res) => {
    try {
        const CertificateData = await db.Certificate.findOne({
            where: {
                UserID: req.query.UserID,
                CourseID: req.query.CourseID,
                ModuleID: req.query.ModuleID,
                LessonID: req.query.LessonID
            },
            order: [['CertificateID', 'DESC']] 
        });
        if (!CertificateData) { return res.status(404).json({ message: "Certificate not found" });}
        res.status(200).json({ message: "Certificate data", data: CertificateData});
    } catch (error) {
        console.error("Error fetching Certificate :", error);
        res.status(500).json({ message: "Sorry! There was a server-side error", error: error.message });
    }
}

//10 ---------------Post quiz--------------------//
const post_certificate_http = async (req, res) => {
    try {
        const Certificate = await db.Certificate.create({
            UserID: req.query.UserID,
            LessonID: req.query.LessonID,
            ModuleID: req.query.ModuleID,
            CourseID: req.query.CourseID,
            Title: req.query.Title,
            CetrificateImageName: req.query. CetrificateImageName,
        });
        if (!Certificate) { return res.status(404).json({ message: "Lesson not found" });}

        // if(req.query.Status == 1){
        //     const CourseDataExist = await db.CourseVideoTrophy.findOne({
        //         where: {
        //             UserID: req.query.UserID,
        //             VideoName: req.query.VideoName
        //         }
        //     });
        //     if(CourseDataExist){
        //         return res.status(400).json({ message: "Course trophy alredy exist!"});
        //     }

        //     const Data = LessonQuiz.dataValues;
        //     const CourseVideoTrophyData = await db.CourseVideoTrophy.create({
        //         CourseVideoID : Data.CourseVideoID,
        //         UserID: Data.UserID,
        //         VideoName: Data.VideoName,
        //         TrophyImageName: req.query.TrophyImageName
        //     });
        //     if (!CourseVideoTrophyData) { return res.status(404).json({ message: "Course not found" });}
        // }
        
        res.status(200).json({ message: "Lesson addedd successfully"});
    } catch (error) {
        res.status(500).json({message: "Failed to add Lesson",error: error});
    }
}

module.exports = {
    post_course_video_http,
    get_course_video_http,
    get_lessonvideo_http,
    post_lessonvideo_http,
    get_lesson_quiz_http,
    post_lesson_quiz_http,
    get_lesson_badge_http,
    post_lesson_badge_http,
    get_certificate_http,
    post_certificate_http
}
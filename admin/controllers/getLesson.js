const { Lesson, lessonportfolio } = require('../models/index');

async function getLessonVideoUrlByIdHttp(req, res) {
    try {
        const { LessonID } = req.query;
        if (!LessonID) {
            return res.status(404).json({
                message: "Lesson not found"
            })
        }

        const lessonData = await Lesson.findByPk(LessonID);

        if (!lessonData) {
            return res.status(404).json({
                message: "Lesson not found"
            })
        }

        return res.status(200).json({
            Data: lessonData.lessonVideo
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was an error while fetching lesson data"
        })
    }
}

async function getLessonTranscriptByIdHttp(req, res) {
    try {
        const { LessonID } = req.query;
        if (!LessonID) {
            return res.status(404).json({
                message: "Lesson not found"
            })
        }

        const lessonData = await lessonportfolio.findOne({ where: { LessonID: LessonID } });

        if (!lessonData) {
            return res.status(404).json({
                message: "Lesson not found"
            })
        }

        return res.status(200).json({
            Data: lessonData.Transcript
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was a server-side error",
        });
    }
}

module.exports = { getLessonVideoUrlByIdHttp, getLessonTranscriptByIdHttp };
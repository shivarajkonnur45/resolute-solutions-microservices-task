const path = require('path');
const { Lesson, lessontopic, lessonbadge, lessonportfolio, lessonquiz } = require('../models/index');
const fs = require('fs');
const asyncFfmpegHandler = require("../helpers/getVideoDuration");
const videoDir = path.join(__dirname, "..", "/volume/Video/");

//! Lesson Edit api ---Starts--->>>

async function editLesson(req, res) {
    // const t = await sequelize.transaction();
    try {
        const { lessonID } = req.params;

        if (!lessonID) {
            return res.status(404).json({
                message: "Lesson not found"
            })
        }
        else {
            const courseId = req.body.courseId;

            const Lt = req?.Lt; // LessonThumbnail
            const ToT = req?.ToT; // TopicThumbnail
            const BaT = req?.BaT; // BadgeThumbnail
            const PoT = req?.PoT; // PortfolioThumbnail
            const LVd = req?.LVd; // LessonVideo
            const LSt = req?.LSt; // LessonSubtitle
            const QQt = req?.QQt; //QuizQuestionsThumbnail
            const QAt = req?.QAt; //QuizAnswerThumbnail

            let lessonDuration = 0;

            if (LVd) {
                lessonDuration = await asyncFfmpegHandler(`${videoDir}/${LVd}`);
            }

            const toUpdateLesson = await Lesson.findByPk(lessonID);

            // History table pending -->>

            // History table pending <<--

            if (!toUpdateLesson) {
                return res.status(404).json({
                    message: "Lesson not found"
                })
            }

            const { LessonData } = req.body;

            if (!LessonData) {
                return res.status(400).json({
                    message: "There was an error while editing lesson"
                })
            }

            const parsedLessonData = await JSON.parse(LessonData);

            if (parsedLessonData && parsedLessonData.length > 0) {
                await Promise.all(parsedLessonData.map(async (singleLesson) => {
                    await Lesson.update({
                        lessonTitle: singleLesson.Title,
                        lessonDesc: singleLesson.Description,
                        isActive: singleLesson.isActive,
                        lessonImage: Lt,
                        lessonVideo: LVd,
                        lessonSubtitle: LSt,
                        lessonVideoDuration: LVd === undefined ? toUpdateLesson.lessonVideoDuration : lessonDuration
                    }, { where: { LessonID: lessonID } });

                    // Lesson Topic
                    if (singleLesson.LessonTopic) {
                        await Promise.all(singleLesson.LessonTopic.map(async (singleTopic) => {
                            let position = singleTopic.position;

                            await lessontopic.update({
                                Title: singleTopic.Title,
                                Transcript: singleTopic.Transcript
                            }, { where: { LessonTopicID: singleTopic.CourseModuleLessonTopicID, LessonID: lessonID } });

                            //Topic Thumbnail Update
                            if (ToT && ToT.length > 0) {
                                await Promise.all(ToT.map(async (singleTopicThumb) => {
                                    const splitMt = singleTopicThumb.split("_");
                                    const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                    if (indexMt == position) {
                                        await lessontopic.update({
                                            TopicImgFile: singleTopicThumb
                                        }, { where: { LessonTopicID: singleTopic.CourseModuleLessonTopicID, LessonID: lessonID } });
                                    }
                                }));
                            }
                        }));
                    }

                    //Lesson Badge
                    if (singleLesson.LessonBadge) {
                        await Promise.all(singleLesson.LessonBadge.map(async (singleTopic) => {
                            let position = singleTopic.position;

                            await lessonbadge.update({
                                Title: singleTopic.Title,
                                Description: singleTopic.Description
                            }, { where: { LessonBadgeID: singleTopic.CourseModuleLessonBadgeID, LessonID: lessonID } });

                            //Badge Thumbnail Update
                            if (BaT && BaT.length > 0) {
                                await Promise.all(BaT.map(async (singleTopicThumb) => {
                                    const splitMt = singleTopicThumb.split("_");
                                    const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                    if (indexMt == position) {
                                        await lessonbadge.update({
                                            LessonBadgeImage: singleTopicThumb
                                        }, { where: { LessonBadgeID: singleTopic.CourseModuleLessonBadgeID, LessonID: lessonID } });
                                    }
                                }));
                            }
                        }));
                    }

                    //Lesson Portfolio
                    if (singleLesson.LessonPortfolio) {
                        await Promise.all(singleLesson.LessonPortfolio.map(async (singleTopic) => {
                            let position = singleTopic.position;

                            await lessonportfolio.update({
                                Title: singleTopic.Title,
                                Description: singleTopic.Description,
                                Transcript: singleTopic.Transcript
                            }, { where: { LessonPortfolioID: singleTopic.CourseModuleLessonPortfolioID, LessonID: lessonID } });

                            //Portfolio Thumbnail Update
                            if (PoT && PoT.length > 0) {
                                await Promise.all(PoT.map(async (singleTopicThumb) => {
                                    const splitMt = singleTopicThumb.split("_");
                                    const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                    if (indexMt == position) {
                                        await lessonportfolio.update({
                                            portfolioImage: singleTopicThumb
                                        }, { where: { LessonPortfolioID: singleTopic.CourseModuleLessonPortfolioID, LessonID: lessonID } });
                                    }
                                }));
                            }
                        }));
                    }

                    //Lesson Quiz
                    if (singleLesson.LessonQuiz) {
                        await Promise.all(singleLesson.LessonQuiz.map(async (singleQuiz) => {
                            if (singleQuiz.CourseModuleLessonQuizID) {
                                let position = singleQuiz.position;

                                await lessonquiz.update({
                                    RightAnswer: singleQuiz.RightAnswer.toString(),
                                    QuizFormat: singleQuiz.QuizFormat,
                                    Question: singleQuiz.Question,
                                    Answers: singleQuiz.Answers,
                                    Position: position
                                }, { where: { LessonQuizID: singleQuiz.CourseModuleLessonQuizID, LessonID: lessonID } });
                            }
                            else {
                                const quizCreated = await lessonquiz.create({
                                    LessonID: lessonID,
                                    ModuleID: singleLesson.moduleId,
                                    courseId: courseId,
                                    RightAnswer: singleQuiz.RightAnswer.toString(),
                                    QuizFormat: singleQuiz.QuizFormat,
                                    Question: singleQuiz.Question,
                                    Answers: singleQuiz.Answers,
                                    Position: singleQuiz.position,
                                    CreatedBy: req.AccDetails?.FirstName + " " + req.AccDetails?.LastName
                                });
                            }
                        }));
                    }

                }));
                // await t.commit();
            }
            return res.status(200).json({
                message: "Lesson Edited Successfully"
            })

        }
    } catch (error) {
        // await t.rollback();
        console.log(error);
        return res.status(500).json({
            message: "Error while editing lesson"
        })
    }
}

//! Lesson Edit api ---Ends--->>>

//! Edit Lessons Files starts here ----------------->>>>>>>>>>>>>>>>>>>

async function editLessonfiles(req, res, next) {
    try {
        if (req.files) {
            // let lessonThumbarray = [];
            let topicArray = [];
            let badgeArray = [];
            let portArray = [];
            let quizQuestionArray = [];
            let quizAnswerArray = [];
            if (req.files.Thumbnail) {
                const imageFile = req.files.Thumbnail;
                const isArrayValidate = Array.isArray(imageFile);

                if (isArrayValidate == false) {
                    let imageReqArray = await imageFile.name.split("_");
                    const imgName = imageReqArray[0];
                    // const position = imageReqArray[imageReqArray.length - 1];
                    if (imgName === "LessonThumbnail") {
                        const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
                        req.Lt = imageFile.name; // Lt -> Lesson Thumbnail
                        await imageFile.mv(uploadDir + imageFile.name);

                    }
                    if (imgName === "TopicThumbnail") {
                        const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
                        topicArray.push(imageFile.name);
                        req.ToT = topicArray; // ToT -> Topic Thumbnail
                        await imageFile.mv(uploadDir + imageFile.name);

                    }
                    if (imgName === "BadgeThumbnail") {
                        const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
                        badgeArray.push(imageFile.name);
                        req.BaT = badgeArray; // Bat -> Badge Thumbnail
                        await imageFile.mv(uploadDir + imageFile.name);

                    }
                    if (imgName === "PortfolioThumbnail") {
                        const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
                        portArray.push(imageFile.name);
                        req.PoT = portArray; // PoT -> Portfolio Thumbnail
                        await imageFile.mv(uploadDir + imageFile.name);
                    }
                    if (imgName === "QuizQuestionImage") {
                        const uploadDir = path.join(__dirname, "..", "/volume/Thumbnail/");
                        quizQuestionArray.push(imageFile.name);
                        req.QQt = quizQuestionArray;
                        await imageFile.mv(uploadDir + imageFile.name);
                    }
                    if (imgName === "QuizAnswer") {
                        const uploadDir = path.join(__dirname, "..", "/volume/Thumbnail/");
                        quizAnswerArray.push(imageFile.name);
                        req.QAt = quizAnswerArray;
                        await imageFile.mv(uploadDir + imageFile.name);
                    }
                }

                if (isArrayValidate == true) {
                    await Promise.all(imageFile.map(async (singleThumbFile) => {
                        let imageReqArray = await singleThumbFile.name.split("_");
                        const imgName = imageReqArray[0];
                        // const position = imageReqArray[imageReqArray.length - 1];
                        if (imgName === "LessonThumbnail") {
                            const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
                            req.Lt = singleThumbFile.name; // Lt -> Lesson Thumbnail
                            await singleThumbFile.mv(uploadDir + singleThumbFile.name);

                        }
                        if (imgName === "TopicThumbnail") {
                            const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
                            topicArray.push(singleThumbFile.name);
                            req.ToT = topicArray; // ToT -> Topic Thumbnail
                            await singleThumbFile.mv(uploadDir + singleThumbFile.name);

                        }
                        if (imgName === "BadgeThumbnail") {
                            const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
                            badgeArray.push(singleThumbFile.name);
                            req.BaT = badgeArray; // Bat -> Badge Thumbnail
                            await singleThumbFile.mv(uploadDir + singleThumbFile.name);

                        }
                        if (imgName === "PortfolioThumbnail") {
                            const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
                            portArray.push(singleThumbFile.name);
                            req.PoT = portArray; // PoT -> Portfolio Thumbnail
                            await singleThumbFile.mv(uploadDir + singleThumbFile.name);
                        }
                        if (imgName === "QuizQuestionImage") {
                            const uploadDir = path.join(
                                __dirname,
                                "..",
                                "/volume/Thumbnail/"
                            );
                            quizQuestionArray.push(singleThumbFile.name);
                            req.QQt = quizQuestionArray;
                            await singleThumbFile.mv(
                                uploadDir + singleThumbFile.name,
                                (err) => {
                                    if (err) console.log(err);
                                }
                            );
                        }
                        if (imgName === "QuizAnswer") {
                            const uploadDir = path.join(
                                __dirname,
                                "..",
                                "/volume/Thumbnail/"
                            );
                            quizAnswerArray.push(singleThumbFile.name);
                            req.QAt = quizAnswerArray;
                            await singleThumbFile.mv(
                                uploadDir + singleThumbFile.name,
                                (err) => {
                                    if (err) console.log(err);
                                }
                            );
                        }
                    }));
                }
            }
            if (req.files.Video) {
                const videoFile = req.files.Video;
                // const isArrayValidate = Array.isArray(videoFile);

                let videoReqArray = await videoFile.name.split("_");
                const videoName = videoReqArray[0];
                if (videoName === "LessonVideo") {
                    const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                    req.LVd = videoFile.name; // LVd -> Lesson Video
                    await videoFile.mv(uploadDir + videoFile.name);

                }

            }
            if (req.files.Subtitle) {
                const subtitleFile = req.files.Subtitle;

                let subReqArray = await subtitleFile.name.split("_");
                const subName = subReqArray[0];
                if (subName === "LessonSubtitle") {
                    const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                    req.LSt = subtitleFile.name; // LSt -> Lesson Subtitle
                    await subtitleFile.mv(uploadDir + subtitleFile.name);
                }

            }
            next();
        }
        else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an error while uploading files"
        })
    }
}

//! Edit Lessons Files ends here ----------------->>>>>>>>>>>>>>>>>>>

//! Lesson Previous Delete ---Starts--->>>

async function deletePreviousLessonsFiles(req, res, next) {
    // const t = await sequelize.transaction();
    try {
        const { lessonID } = req.params;
        const { deletedLessonsFile } = req.body;
        if (deletedLessonsFile) {
            var deletetionArrayLessons = await JSON.parse(deletedModule);
        }
        //! Start
        if (deletetionArrayLessons && deletetionArrayLessons.length > 0) {
            await Promise.all(deletetionArrayLessons.map(async (singleCourse) => {
                if (singleCourse.filesname) {
                    const isFor = await singleCourse.filesname.split("_")[0];
                    if (isFor == "LessonThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await Lesson.update({ lessonImage: null }, { where: { LessonID: lessonID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "LessonVideo") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                        await Lesson.update({ lessonVideo: null }, { where: { LessonID: lessonID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "LessonSubtitle") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                        await Lesson.update({ lessonSubtitle: null }, { where: { lessonSubtitle: singleCourse.filesname, LessonID: lessonID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "TopicThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await lessontopic.update({ TopicImgFile: null }, { where: { TopicImgFile: singleCourse.filesname, LessonID: lessonID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "BadgeThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await lessonbadge.update({ LessonBadgeImage: null }, { where: { LessonBadgeImage: singleCourse.filesname, LessonID: lessonID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "PortfolioThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await lessonportfolio.update({ portfolioImage: null }, { where: { portfolioImage: singleCourse.filesname, LessonID: lessonID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "QuizAnswer") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "QuizQuestion") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                }
            }))
        }
        // await t.commit();
        //! End
        next();
    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(401).json({
            message: "Error while Updating previous files"
        })
    }
}
//! Lesson Previous Delete ---Ends--->>>

module.exports = { deletePreviousLessonsFiles, editLessonfiles, editLesson };
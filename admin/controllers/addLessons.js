const {
  CourseModel,
  Module,
  Lesson,
  lessontopic,
  lessonbadge,
  lessonportfolio,
  lessonquiz,
  sequelize,
} = require("../models/index");
const { sendNotificationViaSqs } = require("../middleware/notification");
const path = require("path");
const asyncFfmpegHandler = require("../helpers/getVideoDuration");
const videoDir = path.join(__dirname, "..", "/volume/Video/");

//! Lesson Upload Controller
async function addLessons(req, res) {
  // const t = await sequelize.transaction();
  try {
    const { LessonData, courseId, moduleId } = req.body;
    const Lt = req.Lt; //LessonThumbnail
    const VLt = req?.VLt; //LessonVideo
    const SLt = req?.SLt; //LessonSubtitle
    const Ttt = req?.Ttt; //LessonTrophyThumbnail
    const Btt = req?.Btt; //LessonBadgeThumbnail
    const Ptt = req?.Ptt; //LessonPortfolioThumbnail
    const QQt = req?.QQt; //QuizQuestionsThumbnail
    const QAt = req?.QAt; //QuizAnswerThumbnail

    const parsedLessonData = await JSON.parse(LessonData);
    const createdBy = req.AccDetails.FirstName + " " + req.AccDetails.LastName;
    if (parsedLessonData && parsedLessonData.length > 0) {
      parsedLessonData.map(async (singleLesson) => {
        const lessonCreated = await Lesson.create({
          lessonTitle: singleLesson.Title,
          lessonDesc: singleLesson.Description,
          courseId: courseId,
          moduleId: singleLesson.moduleId,
        });
        if (Lt && Lt.length > 0) {
          await Promise.all(
            Lt.map(async (singleLt) => {
              const splitLt = await singleLt.split("_");
              const indexedLt = await splitLt[splitLt.length - 1]
                .replace(".jpg", "")
                .replace(".png", "")
                .replace(".jpeg", "");
              if (indexedLt == singleLesson.position) {
                await Lesson.update(
                  { lessonImage: singleLt },
                  { where: { LessonID: lessonCreated.LessonID } }
                );
              }
            })
          );
        }
        if (VLt && VLt.length > 0) {
          await Promise.all(
            VLt.map(async (singleVLt) => {
              const splitVLt = await singleVLt.split("_");
              const indexedLt = await splitVLt[splitVLt.length - 1].replace(
                ".mp4",
                ""
              );
              if (indexedLt == singleLesson.position) {
                const lessonDuration = await asyncFfmpegHandler(
                  `${videoDir}/${singleVLt}`
                );
                await Lesson.update(
                  {
                    lessonVideo: singleVLt,
                    lessonVideoDuration: lessonDuration,
                  },
                  { where: { LessonID: lessonCreated.LessonID } }
                );
              }
            })
          );
        }
        if (SLt && SLt.length > 0) {
          await Promise.all(
            SLt.map(async (singleVLt) => {
              const splitVLt = await singleVLt.split("_");
              const indexedLt = await splitVLt[splitVLt.length - 1]
                .replace(".txt", "")
                .replace(".docx", "");
              if (indexedLt == singleLesson.position) {
                await Lesson.update(
                  { lessonSubtitle: singleVLt },
                  { where: { LessonID: lessonCreated.LessonID } }
                );
              }
            })
          );
        }
        if (lessonCreated) {
          const parsedTopicData = singleLesson.LessonTopic;
          const parsedbadgeData = singleLesson.LessonBadge;
          const parsedPortfolioData = singleLesson.LessonPortfolio;
          const parsedQuizData = singleLesson.LessonQuiz; //! Lesson Quiz --->>

          if (parsedTopicData && parsedTopicData.length > 0) {
            await Promise.all(
              parsedTopicData.map(async (singleTopic) => {
                const topicCreated = await lessontopic.create({
                  LessonID: lessonCreated.LessonID,
                  ModuleID: singleLesson.moduleId,
                  courseId: courseId,
                  Title: singleTopic.Title,
                  Transcript: singleTopic.Transcript,
                  Position: singleTopic.position,
                });
                if (Ttt && Ttt.length > 0) {
                  Ttt.map(async (singleTopicImage) => {
                    const splitTtt = singleTopicImage.split("_");
                    const indexTtt = await splitTtt[splitTtt.length - 1]
                      .replace(".jpg", "")
                      .replace(".png", "");
                    if (indexTtt == singleTopic.position) {
                      await lessontopic.update(
                        { TopicImgFile: singleTopicImage },
                        { where: { LessonTopicID: topicCreated.LessonTopicID } }
                      );
                    }
                  });
                }
              })
            );
          }
          if (parsedbadgeData && parsedbadgeData.length > 0) {
            await Promise.all(
              parsedbadgeData.map(async (singleTopic) => {
                const badgeCreated = await lessonbadge.create({
                  LessonID: lessonCreated.LessonID,
                  ModuleID: singleLesson.moduleId,
                  courseId: courseId,
                  Title: singleTopic.Title,
                  Description: singleTopic.Description,
                  Position: singleTopic.position,
                });
                if (Btt && Btt.length > 0) {
                  Btt.map(async (singleTopicImage) => {
                    const splitTtt = singleTopicImage.split("_");
                    const indexTtt = await splitTtt[splitTtt.length - 1]
                      .replace(".jpg", "")
                      .replace(".png", "");
                    if (indexTtt == singleTopic.position) {
                      await lessonbadge.update(
                        { LessonBadgeImage: singleTopicImage },
                        { where: { LessonBadgeID: badgeCreated.LessonBadgeID } }
                      );
                    }
                  });
                }
              })
            );
          }
          if (parsedPortfolioData && parsedPortfolioData.length > 0) {
            await Promise.all(
              parsedPortfolioData.map(async (singleTopic) => {
                const portfolioCreated = await lessonportfolio.create({
                  LessonID: lessonCreated.LessonID,
                  ModuleID: singleLesson.moduleId,
                  courseId: courseId,
                  Title: singleTopic.Title,
                  Description: singleTopic.Description,
                  Transcript: singleTopic.Transcript,
                  Position: singleTopic.position,
                });
                if (Ptt && Ptt.length > 0) {
                  Ptt.map(async (singleTopicImage) => {
                    const splitTtt = singleTopicImage.split("_");
                    const indexTtt = await splitTtt[splitTtt.length - 1]
                      .replace(".jpg", "")
                      .replace(".png", "")
                      .replace(".jpeg", "");
                    if (indexTtt == singleTopic.position) {
                      await lessonportfolio.update(
                        { portfolioImage: singleTopicImage },
                        {
                          where: {
                            LessonPortfolioID:
                              portfolioCreated.LessonPortfolioID,
                          },
                        }
                      );
                    }
                  });
                }
              })
            );
          }
          if (parsedQuizData && parsedQuizData.length > 0) {
            await Promise.all(
              parsedQuizData.map(async (singleQuiz) => {
                // console.log(singleQuiz);
                // let parsedAnswer = null;
                // if (singleQuiz.Answers) {
                //     parsedAnswer = await singleQuiz.Answers.toString();
                // }
                let allAppendedQuestions = [singleQuiz.Question]; // Creating own "," separated values for questions
                // console.log(singleQuiz.RightAnswer);
                const quizCreated = await lessonquiz.create({
                  LessonID: lessonCreated.LessonID,
                  ModuleID: singleLesson.moduleId,
                  courseId: courseId,
                  RightAnswer: singleQuiz.RightAnswer.toString(),
                  QuizFormat: singleQuiz.QuizFormat,
                  Question: singleQuiz.Question,
                  Answers: singleQuiz.Answers,
                  Position: singleQuiz.position,
                  CreatedBy: createdBy,
                });

                let allAppendedAnswers = []; // Creating own "," separated values for answers
                if (QQt && QQt.length > 0) {
                  QQt.map(async (singleTopicImage) => {
                    const splitTtt = singleTopicImage.split("_");
                    const indexTtt = await splitTtt[splitTtt.length - 1]
                      .replace(".jpg", "")
                      .replace(".png", "")
                      .replace(".jpeg", "");
                    if (indexTtt == singleQuiz.position) {
                      allAppendedQuestions.push(singleTopicImage);
                      await lessonquiz.update(
                        { Question: allAppendedQuestions },
                        { where: { LessonQuizID: quizCreated.LessonQuizID } }
                      );
                    }
                  });
                }
                if (QAt && QAt.length > 0) {
                  QAt.map(async (singleTopicImage) => {
                    const splitTtt = singleTopicImage.split("_");
                    const indexTtt = await splitTtt[splitTtt.length - 1]
                      .replace(".jpg", "")
                      .replace(".png", "")
                      .replace(".jpeg", "");
                    if (indexTtt == singleQuiz.position) {
                      allAppendedAnswers.push(singleTopicImage);
                      await lessonquiz.update(
                        { Answers: allAppendedAnswers },
                        { where: { LessonQuizID: quizCreated.LessonQuizID } }
                      );
                    }
                  });
                }
              })
            );
          }
        }
      });
      await CourseModel.update(
        { isValid: "1" },
        { where: { courseId: courseId } }
      );
      // await t.commit();
      // Notification via sqs <<
      const data = {
        courseId: courseId,
        notify: "Course Added Successfully",
      };
      sendNotificationViaSqs(data); // Sending Notification middleware

      res.status(200).json({
        message: "Lesson Created Successfully",
      });
    }
  } catch (error) {
    // await t.rollback();
    console.log(error);
    res.status(500).json({
      message: "Error while creating lessons",
    });
  }
}

//! ---------------------END----------------------->>>>>>>>>>>>>>>>>

//! Lessons File Upload Middlware
async function lessonsUpload(req, res, next) {
  try {
    if (req.files) {
      let lessonsArray = [];
      let lessonVideoArray = [];
      let lessonSubtitleArray = [];
      let topicArray = [];
      let badgeArray = [];
      let portfolioArray = [];
      let quizQuestionArray = [];
      let quizAnswerArray = [];

      if (req.files.Thumbnail) {
        const imageFile = req.files.Thumbnail;
        const isArrayValidate = Array.isArray(imageFile);
        if (isArrayValidate == false) {
          // Check if its object
          let imageReqArray = await imageFile.name.split("_");
          const imgName = imageReqArray[0];
          // const position = imageReqArray[imageReqArray.length - 1];
          if (imgName === "LessonThumbnail") {
            const uploadDir = path.join(__dirname, "..", "/volume/Thumbnail/");
            lessonsArray.push(imageFile.name);
            req.Lt = lessonsArray;
            await imageFile.mv(uploadDir + imageFile.name);
          }
          if (imgName === "TopicThumbnail") {
            const uploadDir = path.join(__dirname, "..", "/volume/Thumbnail/");
            topicArray.push(imageFile.name);
            req.Ttt = topicArray;
            await imageFile.mv(uploadDir + imageFile.name);
          }
          if (imgName === "BadgeThumbnail") {
            const uploadDir = path.join(__dirname, "..", "/volume/Thumbnail/");
            badgeArray.push(imageFile.name);
            req.Btt = badgeArray;
            await imageFile.mv(uploadDir + imageFile.name);
          }
          if (imgName === "PortfolioThumbnail") {
            const uploadDir = path.join(__dirname, "..", "/volume/Thumbnail/");
            portfolioArray.push(imageFile.name);
            req.Ptt = portfolioArray;
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
          // Check if its Array
          await Promise.all(
            imageFile.map(async (singleThumbFile) => {
              let imageReqArray = await singleThumbFile.name.split("_");
              const imgName = imageReqArray[0];
              // const position = imageReqArray[imageReqArray.length - 1];
              if (imgName === "LessonThumbnail") {
                const uploadDir = path.join(
                  __dirname,
                  "..",
                  "/volume/Thumbnail/"
                );
                lessonsArray.push(singleThumbFile.name);
                req.Lt = lessonsArray;
                await singleThumbFile.mv(uploadDir + singleThumbFile.name);
              }
              if (imgName === "TopicThumbnail") {
                const uploadDir = path.join(
                  __dirname,
                  "..",
                  "/volume/Thumbnail/"
                );
                topicArray.push(singleThumbFile.name);
                req.Ttt = topicArray;
                await singleThumbFile.mv(uploadDir + singleThumbFile.name);
              }
              if (imgName === "BadgeThumbnail") {
                const uploadDir = path.join(
                  __dirname,
                  "..",
                  "/volume/Thumbnail/"
                );
                badgeArray.push(singleThumbFile.name);
                req.Btt = badgeArray;
                await singleThumbFile.mv(uploadDir + singleThumbFile.name);
              }
              if (imgName === "PortfolioThumbnail") {
                const uploadDir = path.join(
                  __dirname,
                  "..",
                  "/volume/Thumbnail/"
                );
                portfolioArray.push(singleThumbFile.name);
                req.Ptt = portfolioArray;
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
            })
          );
        }
      }
      if (req.files.Video) {
        const videoFile = req.files.Video;
        const isArrayValidate = Array.isArray(videoFile);

        if (isArrayValidate == false) {
          // Check if its an object
          let videoReqArray = await videoFile.name.split("_");
          const videoName = videoReqArray[0];
          if (videoName === "LessonVideo") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Video/"
            );
            lessonVideoArray.push(videoFile.name);
            req.VLt = lessonVideoArray;
            await videoFile.mv(uploadDir + videoFile.name);
          }
        }
        if (isArrayValidate == true) {
          // Check if its an array
          await Promise.all(
            videoFile.map(async (singleVideo) => {
              let videoReqArray = await singleVideo.name.split("_");
              const videoName = videoReqArray[0];
              if (videoName === "LessonVideo") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Video/"
                );
                lessonVideoArray.push(singleVideo.name);
                req.VLt = lessonVideoArray;
                await singleVideo.mv(uploadDir + singleVideo.name);
              }
            })
          );
        }
      }
      if (req.files.Subtitle) {
        const subtitleFile = req.files.Subtitle;
        const isArrayValidate = Array.isArray(subtitleFile);

        if (isArrayValidate == false) {
          // Check its an object
          let subReqArray = await subtitleFile.name.split("_");
          const subName = subReqArray[0];
          if (subName === "LessonSubtitle") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Subtitle/"
            );
            lessonSubtitleArray.push(subtitleFile.name);
            req.SLt = lessonSubtitleArray;
            await subtitleFile.mv(uploadDir + subtitleFile.name);
          }
        }
        if (isArrayValidate == true) {
          // Check its an array
          await Promise.all(
            subtitleFile.map(async (singleSub) => {
              let subReqArray = await singleSub.name.split("_");
              const subName = subReqArray[0];
              if (subName === "LessonSubtitle") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Subtitle/"
                );
                lessonSubtitleArray.push(singleSub.name);
                req.SLt = lessonSubtitleArray;
                await singleSub.mv(uploadDir + singleSub.name);
              }
            })
          );
        }
      }
      next();
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while uploading lessons files",
    });
  }
}
//! ---------------------END----------------------->>>>>>>>>>>>>>>>>

//!Course & Lesson Exist Check Middleware
// async function checkExistenceCourseModule(req, res, next) {
//     try {

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: "Course / Module Donot Exist"
//         })
//     }
// }
//! ---------------------END----------------------->>>>>>>>>>>>>>>>>

module.exports = { lessonsUpload, addLessons };

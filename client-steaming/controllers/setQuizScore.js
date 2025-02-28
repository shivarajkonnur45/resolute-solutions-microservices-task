const db = require("../models/index");
const axios = require("axios");
require("dotenv").config();

async function setQuizScoreInStreaming(req, res) {
  try {
    const { UserID, quizScore, LessonId, CourseId } = req.query;
    if (!UserID || !LessonId || !quizScore || !CourseId) {
      return res.status(404).json({
        message: "Something went wrong",
      });
    } else {
      let gradePercentage = null;
      await db.CourseVideo.update(
        { quizScore: quizScore },
        { where: { UserID: UserID, LessonID: LessonId, CourseID: CourseId } }
      );

      const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;

      const respGetGrade = await axios.get(
        `${clientUrl}/planner/flowData/getFlowGrade?courseId=${CourseId}&LessonID=${LessonId}&StudentID=${UserID}`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      if (respGetGrade.data) {
        gradePercentage = respGetGrade.data.percentageReq;
      }

      // console.log(`##########QUIZ SIDE###########`);
      // console.log(gradePercentage);
      // console.log(`#####################`);
      if (gradePercentage != null && parseInt(gradePercentage) <= parseInt(quizScore)) {
        try {
          const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
          const token = process.env.HTTP_REQUEST_SECRET_KEY;

          await db.CourseVideo.update(
            { Status: 1 },
            {
              where: { UserID: UserID, CourseID: CourseId, LessonID: LessonId },
            }
          ); // Single - Single Video Progress
          const updatedCourse = await db.CourseCompletion.update(
            {
              TotalCourseProgress: db.sequelize.literal(
                "TotalCourseProgress + 1"
              ),
            },
            { where: { UserID: UserID, CourseID: CourseId } }
          ); // Total Course Progress

          if (updatedCourse && updatedCourse.length > 0) {
            const updateCompletion = await db.CourseCompletion.findOne({
              where: { UserID: UserID, CourseID: CourseId },
            });

            const clientActivity = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
            const token = process.env.HTTP_REQUEST_SECRET_KEY;

            const courseProgressToSend =
              (updateCompletion.TotalCourseProgress /
                updateCompletion.TotalVideoCount) *
              100;

            await axios.put(
              `${clientActivity}/report/updateCourseCompletion?courseId=${CourseId}&studentId=${UserID}&courseProgress=${courseProgressToSend}`, {},
              {
                headers: { Authorization: "Bearer " + token },
              }
            );
          }

          await axios.get(
            `${clientUrl}/achievement/badgeEvent?UserID=${UserID}&LessonID=${LessonId}&CourseID=${CourseId}&quizScore=${quizScore}`, //! Error due to notification
            {
              headers: { Authorization: "Bearer " + token },
            }
          );

          //Certificate distribution logic
          const isCertificateEligible = await db.CourseCompletion.findOne({
            where: { UserID: UserID, CourseID: CourseId },
          });
          if (
            isCertificateEligible.TotalCourseProgress ===
            isCertificateEligible.TotalVideoCount
          ) {
            // Certificate adding logic to be written here
            const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
            const token = process.env.HTTP_REQUEST_SECRET_KEY;
            await axios.get(
              `${clientUrl}/achievement/courseCertificate?CourseID=${CourseId}&UserID=${UserID}`, //! Error due to notifications
              {
                headers: { Authorization: "Bearer " + token },
              }
            );
          }

          return res.status(200).json({
            message: "Quiz Set!",
          });
        } catch (error) {
          console.log(
            "Error while adding badge! This might happen invalid quiz format"
          );
          console.log(`Reason -> ${error}`);
        }
      }
      else{
        return res.status(200).json({
          message: "Quiz Set!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while storing quiz score",
    });
  }
}

module.exports = setQuizScoreInStreaming;

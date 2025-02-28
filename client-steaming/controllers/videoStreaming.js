const db = require("../models/index");
const axios = require("axios");
require("dotenv").config();

//! Video tracking ---Starts--->>>
async function courseVideoTrack(req, res) {
  try {
    const { AccDetails } = req;

    if (!AccDetails) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    } else {
      const { watchTime, videoUrl, CourseId, ModuleId, LessonId } = req.query;
      if (!watchTime || !videoUrl || !CourseId) {
        return res.status(500).json({
          message: "Something went wrong",
        });
      } else {
        const alreadyWatched = await db.CourseVideo.findOne({
          where: { UserID: AccDetails.UserID, VideoName: videoUrl },
        });
        const courseProgressTracker = await db.CourseCompletion.findOne({
          where: { UserID: AccDetails.UserID, CourseID: CourseId },
        }); // Tracking whole course completion based on videos
        if (!courseProgressTracker) {
          const url = process.env.HTTP_REQUEST_ADMIN;
          const token = process.env.HTTP_REQUEST_SECRET_KEY;
          const respVideoCount = await axios.get(
            `${url}/courseVideoNumbers?courseId=${CourseId}`,
            {
              headers: { Authorization: "Bearer " + token },
            }
          );
          if (respVideoCount.data) {
            await db.CourseCompletion.create({
              UserID: AccDetails.UserID,
              CourseID: CourseId,
              TotalVideoCount: respVideoCount.data.videoCounts,
              TotalCourseProgress: 0,
            });
          }
        }
        if (!alreadyWatched) {
          const url = process.env.HTTP_REQUEST_ADMIN;
          const token = process.env.HTTP_REQUEST_SECRET_KEY;
          const respVideoLength = await axios.get(
            `${url}/getVideoLength?videoUrl=${videoUrl}`,
            {
              headers: { Authorization: "Bearer " + token },
            }
          );
          const ogLengthVideo = respVideoLength.data.videoLength;
          const CourseVideoData = await db.CourseVideo.create({
            UserID: AccDetails.UserID,
            CourseID: CourseId,
            ModuleID: ModuleId,
            LessonID: LessonId,
            VideoName: videoUrl,
            LatestBufferTime: watchTime,
            HightestBufferTime: watchTime,
            VideoLength: ogLengthVideo,
            Status: !LessonId ? 1 : 0,
            userProgress: "0",
          });
          return res.status(200).json({
            message: "Your Session has started",
          });
        } else {
          await db.CourseVideo.update(
            { HightestBufferTime: watchTime },
            { where: { CourseVideoID: alreadyWatched.CourseVideoID } }
          );
          const videoProgressForUser = Math.floor(
            (parseInt(watchTime) / parseInt(alreadyWatched.VideoLength)) * 100
          );
          await db.CourseVideo.update(
            { userProgress: videoProgressForUser },
            { where: { CourseVideoID: alreadyWatched.CourseVideoID } }
          );
          if (
            parseInt(alreadyWatched.VideoLength) - 20 <=
              parseInt(alreadyWatched.HightestBufferTime) &&
            alreadyWatched.Status == 0
          ) {
            // Salt Time is 20sec, Change it depending upon restriction for video to mark finish
            let gradePercentage = null;
            if (LessonId) {
              const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
              const activityUrl = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
              const token = process.env.HTTP_REQUEST_SECRET_KEY;

              const respGetGrade = await axios.get(
                `${clientUrl}/planner/flowData/getFlowGrade?courseId=${CourseId}&LessonID=${LessonId}&StudentID=${AccDetails.UserID}`,
                {
                  headers: { Authorization: "Bearer " + token },
                }
              );
              if (respGetGrade.data) {
                gradePercentage = respGetGrade.data.percentageReq;
              }
              await axios.put(
                `${activityUrl}/report/updateOnStreaming?studentId=${
                  AccDetails.UserID
                }&courseId=${CourseId}&lessonsId=${LessonId}&isStreamed=${true}`,
                {},
                {
                  headers: { Authorization: "Bearer " + token },
                }
              );
            }
            if (gradePercentage == null) {
              // If there is no grade so this will be called hence their is no grade for course and module and if for lesson
              await db.CourseVideo.update(
                { Status: 1 },
                { where: { CourseVideoID: alreadyWatched.CourseVideoID } }
              ); // Single - Single Video Progress
              const updatedCourse = await db.CourseCompletion.update(
                {
                  TotalCourseProgress: db.sequelize.literal(
                    "TotalCourseProgress + 1"
                  ),
                },
                { where: { UserID: AccDetails.UserID, CourseID: CourseId } }
              ); // Total Course Progress

              if (updatedCourse && updatedCourse.length > 0) {
                const updateCompletion = await db.CourseCompletion.findOne({
                  where: { UserID: AccDetails.UserID, CourseID: CourseId },
                });

                const clientActivity =
                  process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
                const token = process.env.HTTP_REQUEST_SECRET_KEY;
                const courseProgressToSend =
                  (updateCompletion.TotalCourseProgress /
                    updateCompletion.TotalVideoCount) *
                  100;

                await axios.put(
                  `${clientActivity}/report/updateCourseCompletion?courseId=${CourseId}&studentId=${AccDetails.UserID}&courseProgress=${courseProgressToSend}`,{},
                  {
                    headers: { Authorization: "Bearer " + token },
                  }
                );
              }

              if (LessonId) {
                const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
                const token = process.env.HTTP_REQUEST_SECRET_KEY;

                //Badge Distribution logic
                await axios.get(
                  `${clientUrl}/achievement/badgeEvent?UserID=${AccDetails.UserID}&LessonID=${LessonId}&CourseID=${CourseId}`,
                  {
                    headers: { Authorization: "Bearer " + token },
                  }
                );
              }

              //Certificate distribution logic
              const isCertificateEligible = await db.CourseCompletion.findOne({
                where: { UserID: AccDetails.UserID, CourseID: CourseId },
              });
              if (
                isCertificateEligible.TotalCourseProgress ===
                isCertificateEligible.TotalVideoCount
              ) {
                const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
                const token = process.env.HTTP_REQUEST_SECRET_KEY;
                // Certificate adding logic to be written here
                await axios.get(
                  `${clientUrl}/achievement/courseCertificate?CourseID=${CourseId}&UserID=${AccDetails.UserID}`,
                  {
                    headers: { Authorization: "Bearer " + token },
                  }
                );
              }
            }
          }
          return res.status(200).json({
            message: "Watch Time Saved",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
//! Video tracking ---Ends--->>>

//! Video Progress for Specific Video ---Starts--->>>
async function getVideoProgressForUser(req, res) {
  try {
    const { AccDetails } = req;

    if (!AccDetails) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    } else {
      const { videoUrl } = req.query;
      if (!videoUrl) {
        return res.status(500).json({
          message: "Something went wrong",
        });
      } else {
        const alreadyWatched = await db.CourseVideo.findOne({
          where: { UserID: AccDetails.UserID, VideoName: videoUrl },
        });
        // console.log(alreadyWatched);
        if (!alreadyWatched) {
          return res.status(200).json({
            message: "Video Progress",
            progress: 0,
            completionStatus: 0,
          });
        } else {
          try {
            const url = process.env.HTTP_REQUEST_ADMIN;
            const token = process.env.HTTP_REQUEST_SECRET_KEY;
            const respVideoLength = await axios.get(
              `${url}/getVideoLength?videoUrl=${videoUrl}`,
              {
                headers: { Authorization: "Bearer " + token },
              }
            );
            const ogLengthVideo = respVideoLength.data.videoLength;
            const videoProgressForUser = Math.floor(
              (parseInt(alreadyWatched.HightestBufferTime) / ogLengthVideo) *
                100
            );
            return res.status(200).json({
              message: "Video Progress",
              watchTimeLatest: alreadyWatched.LatestBufferTime,
              watchTimeMax: alreadyWatched.HightestBufferTime,
              progress: videoProgressForUser,
              completionStatus: alreadyWatched.Status,
              courseId: alreadyWatched.CourseID,
              moduleId: alreadyWatched.ModuleID,
              lessonId: alreadyWatched.LessonID,
            });
          } catch (error) {
            if (error.response) {
              return res.status(error.response.status).json({
                message: error.response.data.message,
              });
            } else {
              console.log(error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}
//! Video Progress for Specific Video ---Ends--->>>

//! Video progress for all videos belonging to User ---Starts--->>>

async function getProgressForAllVideos(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails) {
      return res.status(401).json({
        message: "Invalid Token",
      });
    } else {
      const { UserID } = req.AccDetails;
      if (!UserID) {
        return res.status(404).json({
          message: "User Not Found",
        });
      } else {
        const allVideoUpdates = await db.CourseCompletion.findAll({
          where: { UserID: UserID },
        });
        // if(allVideoUpdates && allVideoUpdates.length > 0){
        //     allVideoUpdates.map(async (singleProgress)=>{
        //         const videoProgressForUser = Math.floor((parseInt(singleProgress.HightestBufferTime) / parseInt(singleProgress.VideoLength) * 100));
        //         await allVideoUpdates
        //     })
        // }
        return res.status(200).json({
          message: "Video Update",
          videoUpdates: allVideoUpdates,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

//! Video progress for all videos belonging to User ---Ends--->>>

module.exports = {
  courseVideoTrack,
  getVideoProgressForUser,
  getProgressForAllVideos,
};

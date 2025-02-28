const db = require("../models/index");
const { Op } = require("sequelize");

async function getCourseCompeletionStatus(req, res) {
  try {
    const { UserId, CourseId } = req.query;
    if (!UserId) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      if (!CourseId) {
        return res.status(404).json({
          message: "Course not found",
        });
      } else {
        const courseSearch = await db.CourseCompletion.findOne({
          where: { UserID: UserId, CourseID: CourseId },
        });
        if (courseSearch) {
          const completionStatus =
            (courseSearch.TotalCourseProgress / courseSearch.TotalVideoCount) *
            100;
          return res.status(200).json({
            completionStatus: completionStatus,
          });
        } else {
          return res.status(404).json({
            message: "Course not found",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

//! Get lesson Completion status
async function getLessonCompletionStatus(req, res) {
  try {
    const { LessonID, UserID } = req.query;
    if (!UserID) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      if (!LessonID) {
        return res.status(404).json({
          message: "Lesson not found",
        });
      } else {
        const getLessonStatus = await db.CourseVideo.findOne({
          where: { UserID: UserID, LessonID: LessonID },
        });
        return res.status(200).json({
          message: "Lesson Status is",
          lessonData: getLessonStatus,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

//! Get all uncompleted Videos
async function getAllUncompletedVideos(req, res) {
  try {
    const { UserId } = req.query;
    if (!UserId) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      const allUncompletedVideos = await db.CourseVideo.findAll({
        where: { UserID: UserId, Status: 0 },
      });
      return res.status(200).json({
        underProgressCourses: allUncompletedVideos,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

//! Get Latest Completed Course for User (Current Count -> 1)
async function getLatestCourseCompleted(req, res) {
  try {
    const { UserId } = req.query;
    if (!UserId) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      const allCompletedCourses = await db.CourseCompletion.findAll({
        where: {
          UserID: UserId,
          TotalCourseProgress: {
            [Op.gte]: db.sequelize.col("TotalVideoCount"),
          },
        },
      });
      let latestCourseCompleted = null;
      if (allCompletedCourses && allCompletedCourses.length > 0) {
        latestCourseCompleted =
          allCompletedCourses[allCompletedCourses.length - 1];
      }
      return res.status(200).json({
        latestCompletedCourse: latestCourseCompleted,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function getLessonLatestData(req, res) {
  try {
    const { courseIds, userId } = req.query;
    const parsedC = JSON.parse(courseIds);
    console.log(parsedC);

    const whereCondition = {};

    whereCondition.UserID = userId;

    whereCondition.CourseID = {
      [Op.in]: parsedC,
    };

    const courseDataToSend = await db.CourseVideo.findAll({
      where: whereCondition,
      order: [["CreatedOn", "DESC"]],
      limit: 1,
    });

    return res.status(200).json({
      courseLatest: courseDataToSend,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function isStreamedToday(req, res) {
  try {
    const { userId } = req.query;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);


    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);


    const isStreamedTodayUser = await db.CourseVideo.findOne({
      where: {
        UserID: userId,
        CreatedOn: {
          [Op.gte]: currentDate,
          [Op.lt]: tomorrow
        }
      }
    });

    if (!isStreamedTodayUser) {
      return res.status(200).json({
        isStreamed: false
      })
    }
    return res.status(200).json({
      isStreamed: true
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Sorry! There was an server-side error'
    });
  }
}

async function getAllLessonCompletionByCourseId(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid token! Login again"
      })
    }

    const { courseId } = req.query;
    if (!courseId) {
      return res.status(404).json({
        message: "Course not found"
      })
    }

    const whereCondition = {};
    whereCondition["UserID"] = AccDetails.UserID;
    whereCondition["CourseID"] = courseId;

    const allCompletedLessons = await db.CourseVideo.findAll({
      where: whereCondition
    });

    return res.status(200).json({
      message: 'Success',
      lessonCompleted: allCompletedLessons
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Sorry! There was an server-side error'
    });
  }
}

module.exports = {
  getCourseCompeletionStatus,
  getLessonCompletionStatus,
  getAllUncompletedVideos,
  getLatestCourseCompleted,
  getLessonLatestData,
  isStreamedToday,
  getAllLessonCompletionByCourseId
};

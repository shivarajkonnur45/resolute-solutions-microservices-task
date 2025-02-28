const db = require("../models/index");
const axios = require("axios");
const notificationBody = require("../notifcationStructure/notificationStruct");
const { Op } = require("sequelize");
const { client } = require("../cache/subscription");

const add_planner = async (req, res, next) => {
  try {
    const { AccDetails } = req;

    const parentId = AccDetails.UserID;

    const result = req.body;
    const cIDs = req.body.CourseIDs;

    var courseIDs = JSON.parse(cIDs);
    // console.log(courseIDs);
    let lIDs = req.body.LessonIDs;
    let Pathways = req.body.Pathways;
    var lessonIDs;
    let pathwayIDs;

    // const courseGrade = req.body.CourseGrades;
    if (lIDs) {
      lessonIDs = JSON.parse(lIDs);
    }
    if (Pathways) {
      pathwayIDs = JSON.parse(Pathways);
    }
    let pathwayString = pathwayIDs.toString();
    // pathwayIDs.map((singlePathway) => {
    //     pathwayString = pathwayString + "," + singlePathway;
    // })
    const isCustomize = req.body.IsCustomize;

    const whereCondition = {};
    whereCondition.AccountType = "1";
    whereCondition.UserID = result.StudentID;

    const StudentData = await db.user.findOne({
      where: whereCondition,
    });

    if (!StudentData) {
      return res.status(404).json({
        message: "Student not exists",
      });
    }

    // const studentGrade = StudentData.Grade;
    // // console.log(courseIDs);
    // // console.log(studentGrade);
    // if(!courseIDs.includes(studentGrade)){
    //     return res.status(401).json({
    //         message:"Your course consist of a grade different from yours. Remove it to move forward!"
    //     })
    // }

    if (Array.isArray(courseIDs) && courseIDs.length > 0) {
      async function validateAndStoreCourseIds(courseIds, isCustomize) {
        try {
          let existingCourses = await get_coursedata_http(courseIds);

          const existingCourseIds = existingCourses.map(
            (course) => course.courseId
          );

          const missingCourseIds = courseIds.filter(
            (id) => !existingCourseIds.includes(id)
          );

          if (missingCourseIds.length > 0) {
            return res.status(400).json({
              message: `Missing Course IDs: ${missingCourseIds.join(",")}`,
            });
          }

          const courseNames = existingCourses.map(
            (course) => course.courseTitle
          );

          let lessonsIDs;
          let lessonsNames;
          if (isCustomize === "0") {
            lessonsIDs = existingCourses.flatMap((course) =>
              course.Lessons.map((lesson) => lesson.LessonID)
            );
            lessonsNames = existingCourses.flatMap((course) =>
              course.Lessons.map((lesson) => lesson.lessonTitle)
            );
          } else if (isCustomize === "1") {
            if (lessonIDs) {
              const existingLessonIDs = existingCourses.flatMap((course) =>
                course.Lessons.map((lesson) => lesson.LessonID)
              );

              lessonsIDs = lessonIDs.filter((id) =>
                existingLessonIDs.includes(id)
              );

              const invalidLessonIDs = lessonIDs.filter(
                (id) => !existingLessonIDs.includes(id)
              );

              if (invalidLessonIDs.length > 0) {
                return res.status(400).json({
                  message: `Invalid lesson IDs: ${invalidLessonIDs.join(",")}`,
                });
              }

              lessonsNames = existingCourses.flatMap((course) => {
                return course.Lessons.filter((lesson) =>
                  lessonsIDs.includes(lesson.LessonID)
                ).map((lesson) => lesson.lessonTitle);
              });
            } else {
              return res.status(400).json({
                message: "Lesson ID Not Provided",
              });
            }
          }
          //   console.log(lessonsIDs);
          const lessonsIDsString = lessonsIDs.join(",");
          const lessonsNamesString = lessonsNames.join(",");

          const CreatedFlow = await db.flow.create({
            StudentID: result.StudentID,
            FirstName: StudentData.FirstName,
            LastName: StudentData.LastName,
            ParentID: StudentData.ParentID,
            CourseIDs: courseIds.join(","),
            Courses: courseNames.join(","),
            LessonIDs: lessonsIDsString,
            Lessons: lessonsNamesString,
            PathwayIDs: pathwayString,
            Grade: result.Grade ?? undefined,
            LearningStyle: result.LearningStyle ?? undefined,
            KnowledgeCheck: result.KnowledgeCheck ?? undefined,
            StartDate: result.StartDate ?? undefined,
            EndDate: result.EndDate ?? undefined,
            BreakTime: result.BreakTime ?? undefined,
            Monday: result.Monday ?? undefined,
            MondayEnd: result.MondayEnd ?? undefined,
            Tuesday: result.Tuesday ?? undefined,
            TuesdayEnd: result.TuesdayEnd ?? undefined,
            Wednesday: result.Wednesday ?? undefined,
            WednesdayEnd: result.WednesdayEnd ?? undefined,
            Thursday: result.Thursday ?? undefined,
            ThursdayEnd: result.ThursdayEnd ?? undefined,
            Friday: result.Friday ?? undefined,
            FridayEnd: result.FridayEnd ?? undefined,
            Saturday: result.Saturday ?? undefined,
            SaturdayEnd: result.SaturdayEnd ?? undefined,
            Sunday: result.Sunday ?? undefined,
            SundayEnd: result.SundayEnd ?? undefined,
            IsCustomize: result.IsCustomize ?? undefined,
            IsActive: result.IsActive,
            CreatedBy: req.AccDetails.FirstName,
            LastModifiedBy: req.AccDetails.FirstName,
          });

          const activityUrl = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
          const token = process.env.HTTP_REQUEST_SECRET_KEY;
          const studentFullName =
            StudentData?.FirstName + " " + StudentData?.LastName;

          //   console.log(lessonsIDs);
          await axios.post(
            `${activityUrl}/report/firstPlanEntry?flowId=${CreatedFlow.FlowID}&studentId=${result.StudentID}&courseId=${courseIDs}&lessonIds=[${lessonsIDs}]&studentName=${studentFullName}&parentId=${parentId}`,
            {},
            {
              headers: { Authorization: "Bearer " + token },
            }
          );

          if (result.KnowledgeCheck === "0") {
            CreatedFlow.Grade = result.Grade ?? undefined;
          }
          if (result.KnowledgeCheck === "1") {
            CreatedFlow.Grade = null;
          }
          for (const course of existingCourses) {
            const existingFlowCourse = await db.flowcoures.findOne({
              where: { courseId: course.courseId },
            });

            if (!existingFlowCourse) {
              const createdFlowCourse = await db.flowcoures.create({
                FlowID: CreatedFlow.FlowID,
                courseId: course.courseId,
                courseCategory: course.courseCategory,
                courseGrade: course.courseGrade,
                courseTag: course.courseTag,
                courseTitle: course.courseTitle,
                courseDesc: course.courseDesc,
                courseImage: course.courseImage,
                courseVideo: course.courseVideo,
                certificateTitle: course.certificateTitle,
                certificateImage: course.certificateImage,
                trophyTitle: course.trophyTitle,
                trophyDesc: course.trophyDesc,
                trophyImage: course.trophyImage,
              });
            }
          }

          const lessonsNames1 = existingCourses.flatMap((course) =>
            course.Lessons.map((lesson) => lesson)
          );

          let createdFlowLesson = [];
          for (const lesson of lessonsNames1) {
            const existingLesson = await db.flowlesson.findOne({
              where: { LessonID: lesson.LessonID },
            });

            if (!existingLesson) {
              createdFlowLesson.push(
                await db.flowlesson.create({
                  FlowID: CreatedFlow.FlowID,
                  Grade: CreatedFlow.Grade,
                  StudentID: result.StudentID,
                  LessonID: lesson.LessonID,
                  courseId: lesson.courseId,
                  lessonTitle: lesson.lessonTitle,
                  lessonDesc: lesson.lessonDesc,
                  lessonImage: lesson.lessonImage,
                  lessonVideo: lesson.lessonVideo,
                  lessonSubtitle: lesson.lessonSubtitle,
                })
              );
            }
          }

          // // Notification Body >>
          // notificationBody.userId = result.StudentID;
          // notificationBody.notificationTitle = `${result.FirstName}, You have been assigned a plan!`;

          // req.visualNotificationBody = notificationBody;
          // // Notification Body <<

          // next(); // Add Notifications to table

          return res.status(200).json({
            message: "Courses and lessons successfully validated and stored.",
            data: CreatedFlow,
          });
        } catch (error) {
          console.log(error);
          return res.status(500).json({
            message: "Error validating courses and lessons.",
            error: error,
          });
        }
      }

      validateAndStoreCourseIds(courseIDs, isCustomize);
    } else {
      const CreatedFlow = await db.flow.create({
        StudentID: result.StudentID,
        FirstName: StudentData.FirstName,
        LastName: StudentData.LastName,
        ParentID: StudentData.ParentID,
        PathwayIDs: pathwayString,
        Grade: result.Grade ?? undefined,
        LearningStyle: result.LearningStyle ?? undefined,
        KnowledgeCheck: result.KnowledgeCheck ?? undefined,
        StartDate: result.StartDate ?? undefined,
        EndDate: result.EndDate ?? undefined,
        BreakTime: result.BreakTime ?? undefined,
        Monday: result.Monday ?? undefined,
        MondayEnd: result.MondayEnd ?? undefined,
        Tuesday: result.Tuesday ?? undefined,
        TuesdayEnd: result.TuesdayEnd ?? undefined,
        Wednesday: result.Wednesday ?? undefined,
        WednesdayEnd: result.WednesdayEnd ?? undefined,
        Thursday: result.Thursday ?? undefined,
        ThursdayEnd: result.ThursdayEnd ?? undefined,
        Friday: result.Friday ?? undefined,
        FridayEnd: result.FridayEnd ?? undefined,
        Saturday: result.Saturday ?? undefined,
        SaturdayEnd: result.SaturdayEnd ?? undefined,
        Sunday: result.Sunday ?? undefined,
        SundayEnd: result.SundayEnd ?? undefined,
        IsCustomize: result.IsCustomize ?? undefined,
        IsActive: result.IsActive,
        CreatedBy: req.AccDetails.FirstName,
        LastModifiedBy: req.AccDetails.FirstName,
      });

      const activityUrl = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;
      const studentFullName =
        StudentData.FirstName + " " + StudentData.LastName;

      await axios.post(
        `${activityUrl}/report/firstPlanEntry?flowId=${CreatedFlow.FlowID}&studentId=${result.StudentID}&courseId=${courseIDs}&lessonIds=[${lessonIDs}]&studentName=${studentFullName}`,
        {},
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      // Notification Body >>
      notificationBody.userId = result.StudentID;
      notificationBody.notificationTitle = `${result.FirstName}, You have been assigned a plan!`;

      req.visualNotificationBody = notificationBody;
      // Notification Body <<

      next(); // Add Notifications to table

      return res.status(200).json({
        message: "Courses and lessons successfully validated and stored.",
        data: CreatedFlow,
      });
    }
  } catch (error) {
    console.error("Error in add_planner:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error,
    });
  }
};

const get_planner = async (req, res) => {
  try {
    let FlowData = await db.flow.findOne({
      where: { FlowID: req.params.FlowID },
    });

    if (!FlowData) {
      return res.status(404).json({ message: "Flow Data not found" });
    }

    return res.status(404).json({ message: FlowData });
  } catch (error) {
    return res.status(400).send({ ErrorCode: "REQUEST", message: error });
  }
};

// GET FLOW BY FILTER STARTDATE AND ENDDATE
const get_all_planner = async (req, res) => {
  try {
    let { userId } = req.query;

    if (!userId) {
      const { AccDetails } = req;
      userId = AccDetails.UserID;
    }
    const { startDate, endDate } = req.query;

    let filterConditions = {};
    filterConditions.ParentID = userId;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filterConditions.StartDate = {
        [db.Sequelize.Op.gte]: start,
        [db.Sequelize.Op.lt]: end,
      };
    }

    let FlowData = await db.flow.findAll({
      where: filterConditions,
    });

    return res.status(200).json({ Data: FlowData });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ ErrorCode: "REQUEST", message: error });
  }
};

async function edit_planner(req, res) {
  try {
    const id = req.params.FlowID;
    const result = req.body;

    const StudentData = await db.user.findOne({
      where: { UserID: result.StudentID },
    });

    if (!StudentData) {
      return res
        .status(400)
        .send({ ErrorCode: "REQUEST", message: "Student Data not found" });
    }

    let existingFlowData = await db.flow.findOne({ where: { FlowID: id } });
    if (!existingFlowData) {
      return res
        .status(400)
        .send({ ErrorCode: "REQUEST", message: "Flow Data not found" });
    }

    const createdHistoryData = await db.flowhistory.create(
      existingFlowData.dataValues
    );
    if (!createdHistoryData) {
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "Failed to create history entry",
      });
    }

    const courseIDs = JSON.parse(result.CourseIDs);

    // console.log(`********************`);
    // console.log(courseIDs, typeof courseIDs);
    // console.log(`********************`);

    const isCustomize = result.IsCustomize;
    let lessonIDs = result.LessonsIDs;

    if (Array.isArray(courseIDs) && courseIDs.length > 0) {
      async function validateAndStoreCourseIds(courseIds, isCustomize) {
        try {
          let existingCourses = await get_coursedata_http(courseIds);

          const existingCourseIds = existingCourses.map(
            (course) => course.courseId
          );

          const missingCourseIds = courseIds.filter(
            (id) => !existingCourseIds.includes(id)
          );

          if (missingCourseIds.length > 0) {
            return res.status(400).json({
              message: `Missing Course IDs: ${missingCourseIds.join(",")}`,
            });
          }

          const courseNames = existingCourses.map(
            (course) => course.courseTitle
          );

          let lessonsIDs;
          let lessonsNames;

          if (isCustomize === "0") {
            lessonsIDs = existingCourses.flatMap((course) =>
              course.Lessons.map((lesson) => lesson.LessonID)
            );
            lessonsNames = existingCourses.flatMap((course) =>
              course.Lessons.map((lesson) => lesson.lessonTitle)
            );
          } else if (isCustomize === "1") {
            if (lessonIDs) {
              lessonsIDs = result.LessonsIDs;

              const existingLessonIDs = existingCourses.flatMap((course) =>
                course.Lessons.map((lesson) => lesson.LessonID)
              );

              const invalidLessonIDs = lessonsIDs.filter(
                (id) => !existingLessonIDs.includes(id)
              );

              if (invalidLessonIDs.length > 0) {
                return res.status(400).json({
                  message: `Invalid lesson IDs: ${invalidLessonIDs.join(",")}`,
                });
              }

              lessonsNames = existingCourses.flatMap((course) => {
                return course.Lessons.filter((lesson) =>
                  lessonsIDs.includes(lesson.LessonID)
                ).map((lesson) => lesson.lessonTitle);
              });
            } else {
              return res.status(400).json({
                message: "Lesson ID Not Provided",
              });
            }
          }

          const lessonsIDsString = lessonsIDs.join(",");

          const lessonsNamesString = lessonsNames.join(",");

          const updatedFlowData = await existingFlowData.update({
            StudentID: result.StudentID ?? existingFlowData.StudentID,
            FirstName: StudentData.FirstName,
            LastName: StudentData.LastName,
            ParentID: req.AccDetails.StaffID,
            CourseIDs: courseIds.join(","),
            Courses: courseNames.join(","),
            LessonIDs: lessonsIDsString,
            Lessons: lessonsNamesString,
            Grade: result.Grade ?? existingFlowData.Grade,
            LearningStyle:
              result.LearningStyle ?? existingFlowData.LearningStyle,
            KnowledgeCheck:
              result.KnowledgeCheck ?? existingFlowData.KnowledgeCheck,
            StartDate: result.StartDate ?? existingFlowData.StartDate,
            BreakTime: result.BreakTime ?? existingFlowData.BreakTime,
            Monday: result.Monday ?? existingFlowData.Monday,
            MondayEnd: result.MondayEnd ?? existingFlowData.MondayEnd,
            Tuesday: result.Tuesday ?? existingFlowData.Tuesday,
            TuesdayEnd: result.TuesdayEnd ?? existingFlowData.TuesdayEnd,
            Wednesday: result.Wednesday ?? existingFlowData.Wednesday,
            WednesdayEnd: result.WednesdayEnd ?? existingFlowData.WednesdayEnd,
            Thursday: result.Thursday ?? existingFlowData.Thursday,
            ThursdayEnd: result.ThursdayEnd ?? existingFlowData.ThursdayEnd,
            Friday: result.Friday ?? existingFlowData.Friday,
            FridayEnd: result.FridayEnd ?? existingFlowData.FridayEnd,
            Saturday: result.Saturday ?? existingFlowData.Saturday,
            SaturdayEnd: result.SaturdayEnd ?? existingFlowData.SaturdayEnd,
            Sunday: result.Sunday ?? existingFlowData.Sunday,
            SundayEnd: result.SundayEnd ?? existingFlowData.SundayEnd,
            IsCustomize: result.IsCustomize ?? existingFlowData.IsCustomize,
            IsActive: result.IsActive ?? existingFlowData.IsActive,
            CreatedBy: req.AccDetails.FirstName,
            LastModifiedBy: req.AccDetails.FirstName,
          });

          return res.status(200).json({
            Message: "Flow information updated successfully!",
            Data: updatedFlowData,
          });
        } catch (error) {
          console.error("Error validating courses and lessons:", error);
          return res.status(500).json({
            message: "Error validating courses and lessons.",
            error: error,
          });
        }
      }

      validateAndStoreCourseIds(courseIDs, isCustomize).catch((error) => {
        console.error("Error in validateAndStoreCourseIds:", error);
        return res.status(500).json({
          message: "Internal server error.",
          error: error,
        });
      });
    } else {
      return res.status(400).json({
        message: "No course IDs to validate or invalid format.",
      });
    }
  } catch (error) {
    console.error("Error updating planner:", error);
    return res.status(500).send({
      ErrorCode: "SERVER_ERROR",
      message: "An error occurred while updating the planner",
    });
  }
}

async function get_planner_count(req, res) {
  try {
    const { AccDetails } = req;
    const id = AccDetails.UserID;
    let { count } = await db.flow.findAndCountAll({
      where: { ParentID: id },
    });

    return res.status(200).json({ Flow_Clount: count });
  } catch (error) {
    console.error("Error Counting planner:", error);
    return res.status(500).send({
      ErrorCode: "SERVER_ERROR",
      message: "An error occurred while counting the planner",
    });
  }
}

async function get_coursedata_http(courseIDs) {
  try {
    const token = process.env.HTTP_REQUEST_SECRET_KEY;
    const url = process.env.HTTP_REQUEST_ADMIN;
    const getCourseData = await axios.get(
      `${url}/courseDataHttp/${courseIDs}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    const useFullCourseData = await getCourseData.data.Data;
    return useFullCourseData;
  } catch (error) {
    console.error("Error in edit_planner:", error);
    return {
      message: "Internal server error.",
      error: error,
    };
  }
}

// async function get_coursedata_http(courseIDs) {
//     let config = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         url: 'http://localhost:4000/api/v1/courseData/[1]',
//         headers: {
//             'Authorization': process.env.HTTP_REQUEST_SECRET_KEY
//         }
//     };

//     axios.request(config)
//         .then((response) => {
//             console.log(JSON.stringify(response.data));
//         })
//         .catch((error) => {
//             console.log(error);
//         });
// }

//! Http get from flow for achievement
async function getFlowGradeHttp(req, res) {
  try {
    const { courseId, LessonID, StudentID } = req.query;
    if (!courseId || !LessonID || !StudentID) {
      return res.status(404).json({
        message: "Error While Fetching Flow Grade! Missing Requirements",
      });
    } else {
      const flowForGrade = await db.flowlesson.findOne({
        where: { StudentID: StudentID, courseId: courseId, LessonID: LessonID },
      });
      if (!flowForGrade) {
        return res.status(200).json({
          percentageReq: null, // Explicity setting it to null in flow grade to handle error
        });
      } else {
        await db.flow.update(
          { IsActive: "3" },
          {
            where: {
              StudentID: StudentID,
              CourseIDs: courseId,
              IsActive: { [Op.eq]: "1" },
            },
          }
        );
        return res.status(200).json({
          percentageReq: flowForGrade.Grade,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error While fetching Flow Grade Data",
    });
  }
}

async function getPlannerForStudent(req, res) {
  try {
    const { studentId } = req.query;

    const flowData = await db.flow.findAll({ StudentID: studentId });

    return res.status(200).json({
      flowData: flowData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error While fetching Flow Data",
    });
  }
}

async function checkStudentAvailability(req, res) {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }

    const { StudentID, StartDate, weekData } = req.body;

    if (!StudentID || !StartDate || !weekData) {
      return res.status(400).json({
        message: "Invalid Arguments",
      });
    }

    const whereCondition = {};

    whereCondition.StudentID = parseInt(StudentID);
    whereCondition.ParentID = AccDetails.UserID;
    whereCondition.IsActive = "1";
    whereCondition.StartDate = StartDate;
    // whereCondition[Op.and] = [{ StartDate: { [Op.lte]: StartDate } }, {}]; // Need to add on week validation
    // whereCondition[weekDay] = weekTime;
    whereCondition[Op.or] = weekData;
    // console.log(whereCondition);

    const isNotAvailable = await db.flow.findOne({
      where: whereCondition,
    });

    if (isNotAvailable) {
      return res.status(200).json({
        available: 0,
      });
    }

    return res.status(200).json({
      available: 1,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function getPlannerForUpdate(req, res) {
  try {
    const { AccDetails } = req;
    const { studentId } = req.query;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }

    if (!studentId) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const plannerData = await db.flow.findAll({
      where: {
        StudentID: studentId,
        ParentID: AccDetails.UserID,
        IsActive: { [Op.ne]: "2" },
      },
    });
    return res.status(200).json({
      message:
        "In isActive -> 0 is completed, 1 is Assigned but not started, 3 is Assigned and also started",
      plannerData: plannerData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function checkWeeklyStreamingTime(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.uniqueID || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid token! Login Again",
      });
    }

    const { courseId } = req.query;
    if (!courseId) {
      return res.status(404).json({
        message: "Planner not found",
      });
    }

    const isValid = await client.get(`${AccDetails.uniqueID}${courseId}`);
    // console.log(isValid);

    if (!isValid) {
      const flowStats = await db.flow.findOne({
        where: {
          StudentID: AccDetails.UserID,
          CourseIDs: parseInt(courseId),
          IsActive: "1",
        },
      });

      if (!flowStats) {
        return res.status(404).json({
          message: "Planner not found",
        });
      }

      if (flowStats.LearningStyle == 0) {
        const now = new Date();
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const dayName = daysOfWeek[now.getDay()] + "End";
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const timeEval = hours + ":" + minutes;
        // console.log(dayName);

        const expTime = flowStats[dayName];
        if (!expTime) {
          return res.status(400).json({
            message: "Invalid type",
          });
        }

        const expArr = expTime.split(":");

        const targetTime = new Date();
        // console.log(targetTime);
        targetTime.setHours(expArr[0], expArr[1], 0, 0);

        if (now < targetTime) {
          const secondsUntilTarget = Math.floor((targetTime - now) / 1000);
          // console.log(secondsUntilTarget);
          await client.set(`${AccDetails.uniqueID}${courseId}`, "1", {
            EX: secondsUntilTarget,
            NX: true,
          });

          const activityUrl = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
          const token = process.env.HTTP_REQUEST_SECRET_KEY;
          const toSendBody = {
            courseId: courseId,
            studentId: AccDetails.UserID,
            studentUUID: AccDetails.uniqueID,
            parentId: AccDetails.ParentID,
            attendedOnDate: targetTime,
            attendedOnDay: daysOfWeek[now.getDay()],
            attendedOnTime: timeEval,
            createdFor: AccDetails?.FirstName + " " + AccDetails?.LastName,
          };

          await axios.post(
            `${activityUrl}/report/studentAttendance`,
            toSendBody,
            {
              headers: { Authorization: "Bearer " + token },
            }
          );
        }
      } else {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const timeEval = hours + ":" + minutes;

        const secondsUntilMidnight =
          (24 - currentHour) * 3600 - currentMinutes * 60 - currentSeconds;

        await client.set(`${AccDetails.uniqueID}${courseId}`, "1", {
          EX: secondsUntilMidnight,
          NX: true,
        });

        const activityUrl = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const toSendBody = {
          courseId: courseId,
          studentId: AccDetails.UserID,
          studentUUID: AccDetails.uniqueID,
          parentId: AccDetails.ParentID,
          attendedOnDate: now,
          attendedOnDay: daysOfWeek[now.getDay()],
          attendedOnTime: timeEval,
          createdFor: AccDetails?.FirstName + " " + AccDetails?.LastName,
        };

        await axios.post(
          `${activityUrl}/report/studentAttendance`,
          toSendBody,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );
      }
    }
    return res.status(200).json({
      message: "Server configured successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function getPlannerForWeeklyView(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }

    const { todayDate, todayDay } = req.query;
    if (!todayDate || !todayDay) {
      return res.status(404).json({
        message: "No dates provided",
      });
    }

    const whereCondition = {};
    whereCondition.StudentID = AccDetails.UserID;

    whereCondition.StartDate = {
      [Op.lte]: todayDate,
    };
    whereCondition.EndDate = {
      [Op.gte]: todayDate,
    };

    whereCondition[todayDay] = {
      [Op.ne]: "null",
    };

    whereCondition.IsActive = {
      [Op.in]: ["1", "3"],
    };

    const plannerWeeklyData = await db.flow.findAll({
      where: whereCondition,
    });

    //* Quiz completion status
    const activityUrl = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
    const token = process.env.HTTP_REQUEST_SECRET_KEY;

    const respQuizC = await axios.get(
      `${activityUrl}/report/studentQuizList?userId=${AccDetails.UserID}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    const respQuizData = respQuizC.data.quizData;

    //* Portfolio status
    const portData = await db.portfolio.findAll({
      where: {
        StudentID: AccDetails.UserID,
      },
    });

    // const plannerForTitle = await db.flowlesson.findAll({
    //   where: {
    //     StudentID: AccDetails.UserID,
    //   },
    // });
    // let courseID = [];

    // for (let i = 0; i < plannerWeeklyData.length; i++) {

    //   courseID.push(plannerWeeklyData[i].CourseIDs);
    // }

    // console.log(courseID);

    // const streamingUrl = process.env.HTTP_REQUEST_CLIENT_STREAM;
    // const token = process.env.HTTP_REQUEST_SECRET_KEY;

    // const lessonData = await axios.get(
    //   `${streamingUrl}/latestLesson?courseIds=[${courseID}]&userId=${AccDetails.UserID}`,
    //   {
    //     headers: { Authorization: "Bearer " + token },
    //   }
    // );

    // const respLessonData = lessonData.data.courseLatest;
    // console.log(respLessonData);

    const plannerWeeklyDataNewData = plannerWeeklyData.map((singlePlan) => {
      const lessonArr = singlePlan.LessonIDs.split(",");
      let toSendLesson = [];
      let toSendPort = [];

      respQuizData.find((lesson) => {
        if (
          lesson.courseId == singlePlan.CourseIDs &&
          lessonArr.includes(lesson.lessonId)
        ) {
          toSendLesson = [...toSendLesson, lesson.lessonId];
          // singlePlan.dataValues["lessonQuizCompletedArray"] = toSendLesson;
        }
      });

      portData.find((port) => {
        if (
          port.CourseID == singlePlan.CourseIDs &&
          lessonArr.includes(port.LessonID)
        ) {
          toSendPort = [...toSendPort, port.LessonID];
        }
      });

      singlePlan.dataValues["lessonQuizCompletedArray"] = toSendLesson;
      singlePlan.dataValues["lessonPortfolioArray"] = toSendPort;

      return singlePlan;
    });

    return res.status(200).json({
      weeklyPlanData: plannerWeeklyDataNewData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function getPlannerForWeeklyOverview(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }

    const { todayDate } = req.query;
    if (!todayDate) {
      return res.status(404).json({
        message: "No dates provided",
      });
    }
    const today = new Date();

    const oneWeekFromToday = new Date(today);
    oneWeekFromToday.setDate(today.getDate() + 7);

    const oneWeekFromTodayDate = oneWeekFromToday.toISOString().split("T")[0];

    let whereCondition = {};

    whereCondition = {
      [Op.or]: [
        {
          StartDate: {
            [Op.between]: [todayDate, oneWeekFromTodayDate],
          },
        },
        {
          EndDate: {
            [Op.between]: [todayDate, oneWeekFromTodayDate],
          },
        },
        {
          [Op.and]: [
            {
              StartDate: { [Op.lte]: todayDate },
            },
            {
              EndDate: { [Op.gte]: oneWeekFromTodayDate },
            },
          ],
        },
      ],
    };

    whereCondition.StudentID = AccDetails.UserID;

    const plannerWeeklyData = await db.flow.findAll({
      where: whereCondition,
    });

    //* Quiz completion status
    const activityUrl = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
    const token = process.env.HTTP_REQUEST_SECRET_KEY;

    const respQuizC = await axios.get(
      `${activityUrl}/report/studentQuizList?userId=${AccDetails.UserID}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    const respQuizData = respQuizC.data.quizData;

    //* Portfolio status
    const portData = await db.portfolio.findAll({
      where: {
        StudentID: AccDetails.UserID,
      },
    });

    const plannerWeeklyDataNewData = plannerWeeklyData.map((singlePlan) => {
      const lessonArr = singlePlan.LessonIDs.split(",");
      let toSendLesson = [];
      let toSendPort = [];

      respQuizData.find((lesson) => {
        if (
          lesson.courseId == singlePlan.CourseIDs &&
          lessonArr.includes(lesson.lessonId)
        ) {
          toSendLesson = [...toSendLesson, lesson.lessonId];
          // singlePlan.dataValues["lessonQuizCompletedArray"] = toSendLesson;
        }
      });

      portData.find((port) => {
        if (
          port.CourseID == singlePlan.CourseIDs &&
          lessonArr.includes(port.LessonID)
        ) {
          toSendPort = [...toSendPort, port.LessonID];
        }
      });

      singlePlan.dataValues["lessonQuizCompletedArray"] = toSendLesson;
      singlePlan.dataValues["lessonPortfolioArray"] = toSendPort;

      return singlePlan;
    });

    return res.status(200).json({
      Data: plannerWeeklyDataNewData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function getPlannerFromCourseIdBtwTime(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid token! Login Again",
      });
    }

    const { courseId } = req.query;
    if (!courseId) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }

    const whereCondition = {};
    whereCondition["CourseIDs"] = courseId;
    whereCondition["StudentID"] = AccDetails.UserID;

    const plannerData = await db.flow.findOne({
      where: whereCondition,
    });

    if (!plannerData) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    return res.status(200).json({
      plannerCourseData: plannerData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function validateForStreamTime(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid token! Login Again",
      });
    }

    const { courseId } = req.query;
    if (!courseId) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }

    const whereCondition = {};
    whereCondition["CourseIDs"] = courseId;
    whereCondition["StudentID"] = AccDetails.UserID;

    const plannerData = await db.flow.findOne({
      where: whereCondition,
    });

    if (!plannerData) {
      return res.status(404).json({
        message: "Course not found!",
      });
    }
    //isGoodToGo 2 -> means not have any date today, 3 -> means missed the date, 4 -> means early
    const currentDate = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const dayOfWeek = daysOfWeek[currentDate.getDay()];

    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    // console.log(plannerData)
    if (plannerData?.LearningStyle == 0) {
      const backendPlannerData = plannerData;
      const backendStartTimeArr = backendPlannerData[dayOfWeek].split(":");
      const backendEndTimeArr =
        backendPlannerData[`${dayOfWeek}End`].split(":");

      // There is no planner for that day
      if (
        !backendPlannerData[dayOfWeek] &&
        !backendPlannerData[`${dayOfWeek}End`]
      ) {
        return res.status(200).json({
          message: "You donot have any class today",
          isGoodToGo: 2
        })
      }

      //There is planner but student is early
      if (Number(backendStartTimeArr[0]) >= hours) {
        if (Number(backendStartTimeArr[1]) >= minutes) {
          return res.status(200).json({
            message: "You are early Hold on tight",
            isGoodToGo: 4
          })
        }
      }

      // There is planner but student missed
      if (Number(backendStartTimeArr[0]) <= hours) {
        if (Number(backendStartTimeArr[1]) + 10 <= minutes) {
          const cacheStreamed = await client.get(`${AccDetails.UserID}-${AccDetails.FirstName}-${courseId}`);

          if (!cacheStreamed) {
            const streamUrl = process.env.HTTP_REQUEST_CLIENT_STREAM;
            const token = process.env.HTTP_REQUEST_SECRET_KEY;
            const isStreamedToday = await axios.get(`${streamUrl}/isStreamedToday?userId=${AccDetails.UserID}`, {
              headers: { "Authorization": "Bearer " + token }
            });
            await client.set(`${AccDetails.UserID}-${AccDetails.FirstName}-${courseId}`, "1", {
              EX: 86400, // For a day 86400 sec
              NX: true,
            });
            if (isStreamedToday?.data?.isStreamed) {
              return res.status(200).json({
                message: "All the best!",
                isGoodToGo: 1
              })
            }
          }

          if (cacheStreamed && cacheStreamed == 1) {
            return res.status(200).json({
              message: "All the best!",
              isGoodToGo: 1
            })
          }

          return res.status(200).json({
            message: "You have missed class today",
            isGoodToGo: 3
          })

        }
      }
    }
    return res.status(200).json({
      message: "All the best!",
      isGoodToGo: 1
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Sorry! There was an server-side error'
    });
  }
}


module.exports = {
  add_planner,
  get_planner,
  get_coursedata_http,
  get_all_planner,
  edit_planner,
  get_planner_count,
  getFlowGradeHttp,
  getPlannerForStudent,
  checkStudentAvailability,
  getPlannerForUpdate,
  checkWeeklyStreamingTime,
  getPlannerForWeeklyView,
  getPlannerForWeeklyOverview,
  getPlannerFromCourseIdBtwTime,
  validateForStreamTime
};

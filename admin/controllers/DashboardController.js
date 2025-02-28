const { Op } = require("sequelize");
const db = require("../models/index");
const axios = require("axios");

const get_dashboard = async (req, res) => {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }
    const { gradeFilter } = req.query;
    if (!gradeFilter) {
      return res.status(400).json({
        message: "Invalid Args",
      });
    }

    const userId = AccDetails.UserID;
    // console.log(userId)
    const topCourses = await db.CourseModel.findAll({
      attributes: ["courseId", "courseTitle"],
    });
    const courseMap = {};
    topCourses.forEach((course) => {
      courseMap[course.courseId] = course.courseTitle;
    });
    const url = `${process.env.HTTP_REQUEST_CLIENTLIENT}/planner/?userId=${userId}`;
    const token = process.env.HTTP_REQUEST_SECRET_KEY;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.error) {
      console.log(response.error);
    }

    const coursesAssigned = [];
    const courseStudentMap = {};
    let structuredCount = 0;
    let selfPacedCount = 0;
    let totalStudents = 0;

    const gradeCounts = {};

    const filterArr = gradeFilter.split(",");
    for (let y = 0; y < filterArr.length; y++) {
      const gradeSetter = `grade${filterArr[y]}`;
      gradeCounts[gradeSetter] = 0;
    }

    if (response.data.Data) {
      for (const item of response.data.Data) {
        if (item.CourseIDs != null) {
          const courseIDs = item.CourseIDs.split(",").map((id) =>
            parseInt(id, 10)
          );

          for (const courseId of courseIDs) {
            if (!coursesAssigned.includes(courseId)) {
              coursesAssigned.push(courseId);
            }
            if (!courseStudentMap[courseId]) {
              courseStudentMap[courseId] = [];
            }
            courseStudentMap[courseId].push(item.StudentID);

            const courseDataForGrade = await db.CourseModel.findByPk(courseId);
            if (courseDataForGrade) {
              const gradeArr = courseDataForGrade.courseGrade.split(",");
              if (gradeArr.length > 0) {
                for (let i = 0; i < gradeArr.length; i++) {
                  const toCheck = `grade${gradeArr[i]}`;
                  gradeCounts[toCheck] = gradeCounts[toCheck] + 1;
                }
              }
            }
          }
        }

        if (item.LearningStyle === 1) {
          structuredCount++;
        } else if (item.LearningStyle === 0) {
          selfPacedCount++;
        }
        totalStudents++;
      }
    }

    const formattedResponse = {
      assignedCourses: coursesAssigned,
      courseStudentAssignments: [],
    };

    Object.keys(courseStudentMap).forEach((courseId) => {
      const studentCount = courseStudentMap[courseId].length;
      formattedResponse.courseStudentAssignments.push({
        courseId: parseInt(courseId, 10),
        courseName: courseMap[courseId],
        studentCount: studentCount,
      });
    });
    const LearningStyle = {
      structured: Math.round((structuredCount / totalStudents) * 100),
      selfPaced: Math.round((selfPacedCount / totalStudents) * 100),
    };

    const allInterestedData = await db.CourseInterested.findAll({
      where:{courseGrade:{[Op.like]:`%${gradeFilter}%`}}
  });
    let toSendCourseData = {};
    allInterestedData.map((interested) => {
      if (
        !toSendCourseData[`${interested.CourseName}+${interested.CourseID}`]
      ) {
        toSendCourseData[
          `${interested.CourseName}+${interested.CourseID}`
        ] = 1;
      } else {
        toSendCourseData[
          `${interested.CourseName}+${interested.CourseID}`
        ] += 1;
      }
    });

    return res.status(200).json({
      message: "Courses retrieved successfully",
      AssignedCourses: formattedResponse,
      LearningStyle: LearningStyle,
      gradePercentages: gradeCounts,
      upComingCourse: toSendCourseData,
      interestedLength: allInterestedData.length
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
module.exports = { get_dashboard };

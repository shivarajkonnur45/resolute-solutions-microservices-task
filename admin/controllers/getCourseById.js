const {
  CourseModel,
  Module,
  Lesson,
  lessontopic,
  lessonbadge,
  lessonportfolio,
  lessonquiz,
  CourseCategory,
  Pathway,
} = require("../models/index");
const { Op } = require("sequelize");

async function getCourseByID(req, res) {
  try {
    const { courseID } = req.params;
    if (!courseID) {
      res.status(404).json({
        message: "Course Not Found",
      });
    } else {
      // console.log(courseID);
      const courseIdData = await CourseModel.findByPk(courseID, {
        where: { isActive: { [Op.ne]: "2" } },
        include: [
          {
            model: Module,
            where: { isActive: { [Op.ne]: "2" } },
            required: false,
          },
          {
            model: Lesson,
            where: { isActive: { [Op.ne]: "2" } },
            required: false,
          },
          {
            model: lessontopic,
            where: { isActive: { [Op.ne]: "2" } },
            required: false,
          },
          {
            model: lessonbadge,
            where: { isActive: { [Op.ne]: "2" } },
            required: false,
          },
          {
            model: lessonportfolio,
            where: { isActive: { [Op.ne]: "2" } },
            required: false,
          },
          {
            model: lessonquiz,
            where: { isActive: { [Op.ne]: "2" } },
            required: false,
          },
        ],
      });

      if (!courseIdData) {
        res.status(404).json({
          message: "no data found",
        });
      } else {
        const allCourseCat = await courseIdData.courseCategory.split(",");
        const courseCatDatas = await CourseCategory.findAll({
          where: {
            CourseCategoryID: allCourseCat,
            isLinkedTo: { [Op.gte]: 1 }
          }
        });
        return res.status(200).json({
          message: "course data",
          data: courseIdData,
          catData: courseCatDatas,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function getCourseByGrade(req, res) {
  try {
    const gradeParam = req.params.CourseGrade;
    const pageNo = req.params.Page ? req.params.Page : 1;
    const pageSize = 5;
    const offset = (pageNo - 1) * pageSize;
    if (!gradeParam || gradeParam == "undefined") {
      let combinedArray = []; // Creating an combined array for both course and pathway
      const courseArrayData = await CourseModel.findAll({
        limit: pageSize,
        offset: offset,
      });
      combinedArray = [...courseArrayData]; // concat it with course data
      //Fetching pathway data for Merging pathway data to course data
      const pathwayArrayData = await Pathway.findAll({
        limit: pageSize,
        offset: offset,
      });
      if (pathwayArrayData && pathwayArrayData.length > 0) {
        combinedArray = [...combinedArray, ...pathwayArrayData]; // If pathway exist concat it with that also
      }
      res.status(200).json({
        message: "All Course",
        data: combinedArray,
      });
    } else {
      const gradeArray = JSON.parse(gradeParam);
      let courseDataGrade = []; // Course data based on grade
      let courseIDCheck = []; // Course data to check if the id already exist in the array

      let pathwayDataGrade = []; // Pathway data based on grade
      let pathwayIDCheck = []; // Pathway data to check if the id already exist in the array
      await Promise.all(
        gradeArray.map(async (singk) => {
          const dataFound = await CourseModel.findAll({
            where: { courseGrade: { [Op.like]: `%${singk}%` } },
            limit: pageSize,
            offset: offset,
          });
          const dataFoundPathway = await Pathway.findAll({
            where: { Grade: { [Op.like]: `%${singk}%` } },
            limit: pageSize,
            offset: offset,
          });
          // Validation and data pushing for Course data
          await Promise.all(
            await dataFound.map(async (sin) => {
              const newFilter = sin.courseGrade.split(",");
              if (courseDataGrade.length > 0) {
                if (!courseIDCheck.includes(sin.courseId)) {
                  gradeArray.map((singleGrade) => {
                    //! Data Duplicates Error
                    if (newFilter.includes(singleGrade)) {
                      courseDataGrade.push(sin);
                    }
                  });
                  courseIDCheck.push(sin.courseId);
                }
              } else if (courseDataGrade.length === 0) {
                gradeArray.map((singleGrade) => {
                  if (newFilter.includes(singleGrade)) {
                    courseDataGrade.push(sin);
                  }
                });
                courseIDCheck.push(sin.courseId);
              }
            })
          );

          //Validation and data pushing for Pathway data
          await Promise.all(
            await dataFoundPathway.map(async (sin) => {
              const newFilter = sin.Grade.split(",");
              if (pathwayDataGrade.length > 0) {
                if (!pathwayIDCheck.includes(sin.PathwayID)) {
                  gradeArray.map((singleGrade) => {
                    //! Data Duplicates Error
                    if (newFilter.includes(singleGrade)) {
                      courseDataGrade.push(sin);
                    }
                  });
                  pathwayIDCheck.push(sin.PathwayID);
                }
              } else if (pathwayDataGrade.length === 0) {
                gradeArray.map((singleGrade) => {
                  if (newFilter.includes(singleGrade)) {
                    pathwayDataGrade.push(sin);
                  }
                });
                pathwayIDCheck.push(sin.PathwayID);
              }
            })
          );
        })
      );

      courseDataGrade = [...courseDataGrade, ...pathwayDataGrade]; // Merging the data from course and pathway
      res.status(200).json({
        message: "Course Data",
        data: courseDataGrade,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function getCourseModuleLessonLength(req, res) {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(404).json({
        message: "No Course Found",
      });
    } else {
      const courseIdData = await CourseModel.findByPk(courseId, {
        where: { isActive: { [Op.ne]: "2" } },
        include: [
          {
            model: Module,
            where: { isActive: { [Op.ne]: "2" } },
            required: false,
          },
          {
            model: Lesson,
            where: { isActive: { [Op.ne]: "2" } },
            required: false,
          },
        ],
      });
      if (courseIdData) {
        let totalVideoCount = 0;
        // Only Storing the lessons video count (Course and Module is not necessary)
        if (courseIdData.Lessons) {
          totalVideoCount = totalVideoCount + courseIdData.Lessons.length;
        }
        return res.status(200).json({
          videoCounts: totalVideoCount,
        });
      } else {
        return res.status(404).json({
          message: "No Course Found",
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

async function getLessonBadgeLength(req, res) {
  try {
    const { CourseId, LessonId } = req.query;
    if (!CourseId) {
      return res.status(404).json({
        message: "Course not found",
      });
    } else {
      const allLessonBadge = await lessonbadge.findAll({
        where: { courseId: CourseId },
      });
      let specBadgeCount = null;
      if (LessonId) {
        specBadgeCount = await lessonbadge.findAll({
          where: { LessonID: LessonId },
        });
      }

      return res.status(200).json({
        lessonBadgeCount: allLessonBadge.length,
        specBadgeCount: specBadgeCount == null ? 0 : specBadgeCount.length,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while fetching data",
    });
  }
}

//! Course & Certificate title http request
async function getCourseCertificateTitle(req, res) {
  try {
    const { CourseId } = req.query;
    if (!CourseId) {
      return res.status(404).json({
        message: "Course not found",
      });
    } else {
      const courseData = await CourseModel.findByPk(CourseId);
      if (courseData) {
        return res.status(200).json({
          courseTitle: courseData.courseTitle,
          certificateTitle: courseData.certificateTitle,
        });
      } else {
        return res.status(404).json({
          message: "Course not found",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while fetching data",
    });
  }
}

module.exports = {
  getCourseByGrade,
  getCourseByID,
  getCourseModuleLessonLength,
  getLessonBadgeLength,
  getCourseCertificateTitle,
};

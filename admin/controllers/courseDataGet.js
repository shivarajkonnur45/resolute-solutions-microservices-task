const {
  CourseModel,
  CourseCategory,
  Pathway,
  Module,
  Lesson,
  lessontopic,
  lessonbadge,
  lessonportfolio,
  lessonquiz,
} = require("../models/index");
const { Op } = require("sequelize");

async function getCourseData(req, res) {
  try {
    const { foundCategory } = req;
    const { courseGradeParams } = req.query;
    // console.log(courseGradeParams);

    //Pagination content
    const { pageNo } = req.query;
    const pageSize = 5;
    const offset = (pageNo - 1) * pageSize;
    // console.log(pageNo);
    // console.log(offset);
    let whereCondition = {};
    let pathwayWhere = {};
    if (foundCategory) {
      whereCondition.courseCategory = {
        [Op.like]: `%${foundCategory}%`,
      };
    }

    if (courseGradeParams && courseGradeParams != "All") {
      whereCondition.courseGrade = {
        [Op.like]: `%${courseGradeParams}%`,
      };
    }

    // if(courseGradeParams == 'All'){

    // }

    if (courseGradeParams && courseGradeParams != "All") {
      pathwayWhere.Grade = {
        [Op.like]: `%${courseGradeParams}%`,
      };
    }

    // console.log(whereCondition);
    let courseDataToSend = await CourseModel.findAll({
      where: whereCondition,
      limit: pageSize,
      offset: offset,
    });

    const pathwayDataToSend = await Pathway.findAll({
      where: pathwayWhere,
      limit: pageSize,
      offset: offset,
    });

    courseDataToSend = [...courseDataToSend, ...pathwayDataToSend];
    return res.status(200).json({
      Data: courseDataToSend,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

//! Fetching Categories id and pushing it in req body

async function getCourseCategoryByID(req, res, next) {
  try {
    const { courseCategory } = req.query;

    // console.log(courseCategory);
    if (!courseCategory) {
      next();
    } else {
      const courseCategoryData = await CourseCategory.findOne({
        where: { CategoryName: courseCategory },
      });
      // console.log(courseCategoryData);
      req.foundCategory = courseCategoryData.CourseCategoryID;
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function getAllCourseDataByID(req, res) {
  try {
    const courseString = req.query.courseIDs;
    // console.log(typeocourseString);
    const typeOFCourse = Array.isArray(courseString);
    // console.log(courseString);
    // console.log(typeOFCourse);
    // const allIDs = await courseString.split(",");
    const parsedCourse =
      typeOFCourse == true ? courseString : JSON.parse(courseString);
    // console.log(Array.isArray(parsedCourse));
    let allCourse = [];
    await Promise.all(
      parsedCourse.map(async (singleCourse) => {
        const foundCourse = await CourseModel.findOne({
          where: { courseId: singleCourse, isActive: { [Op.ne]: "2" } },

          include: [
            { model: Module, where: { isActive: { [Op.ne]: "2" } }, required: false },
            { model: Lesson, where: { isActive: { [Op.ne]: "2" } }, required: false },
            { model: lessontopic, where: { isActive: { [Op.ne]: "2" } }, required: false },
            { model: lessonbadge, where: { isActive: { [Op.ne]: "2" } }, required: false },
            { model: lessonportfolio, where: { isActive: { [Op.ne]: "2" } }, required: false },
            { model: lessonquiz, where: { isActive: { [Op.ne]: "2" } }, required: false },
          ],
        });
        if (foundCourse) {
          await allCourse.push(foundCourse);
        }
      })
    );

    // let courseID = await allIDs.map((sn) => {
    //     return parseInt(sn);
    // });
    // if (!courseID || courseID.length == 0) {
    //     courseID = [1];
    // }
    // const allCourse = await CourseModel.findAll({
    //     where: { courseId: courseID },
    //     include: [
    //         { model: Module },
    //         { model: Lesson },
    //         { model: lessontopic },
    //         { model: lessonbadge },
    //         { model: lessonportfolio },
    //         { model: lessonquiz },
    //     ]
    // });
    return res.status(200).json({
      message: "Courses Data",
      Data: allCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function getAllCourseDataByID_http(req, res) {
  try {
    const courseString = req.params.courseIDs;

    let parsedCourse;
    try {
      parsedCourse = JSON.parse(courseString);

      if (!Array.isArray(parsedCourse)) {
        if (
          typeof parsedCourse === "number" ||
          typeof parsedCourse === "string"
        ) {
          parsedCourse = [parsedCourse];
        } else {
          throw new Error("Parsed course data is not an array or single value");
        }
      }
    } catch (error) {
      parsedCourse = courseString.split(",").map((id) => id.trim());

      if (parsedCourse.every((id) => !isNaN(id))) {
        parsedCourse = parsedCourse.map((id) => Number(id));
      }

      if (!Array.isArray(parsedCourse) || parsedCourse.length === 0) {
        return res.status(400).json({
          message:
            "Invalid courseIDs format. Expected a JSON array or a comma-separated string.",
          error: error.message,
        });
      }
    }

    let allCourse = [];
    await Promise.all(
      parsedCourse.map(async (singleCourse) => {
        const foundCourse = await CourseModel.findByPk(singleCourse, {
          include: [
            { model: Module },
            { model: Lesson },
            { model: lessontopic },
            { model: lessonbadge },
            { model: lessonportfolio },
            { model: lessonquiz },
          ],
        });
        if (foundCourse) {
          allCourse.push(foundCourse);
        }
      })
    );

    res.status(200).json({
      message: "Courses Data",
      Data: allCourse,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was a server-side error",
      error: error.message,
    });
  }
}

async function getCourseDataBySingleId(req, res) {
  try {
    const { CourseId } = req.params;
    // console.log(CourseId);
    if (!CourseId) {
      const firstCourseData = await CourseModel.findByPk(1, {
        include: [
          { model: Module, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: Lesson, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: lessontopic, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: lessonbadge, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: lessonportfolio, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: lessonquiz, where: { isActive: { [Op.ne]: "2" } }, required: false },
        ],
      });
      return res.status(200).json({
        message: "Course Data",
        Data: firstCourseData,
      });
    } else {
      const courseById = await CourseModel.findOne({
        where: { courseId: CourseId, isActive: { [Op.ne]: "2" } },
        include: [
          { model: Module, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: Lesson, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: lessontopic, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: lessonbadge, where: { isActive: { [Op.ne]: "2" } }, required: false},
          { model: lessonportfolio, where: { isActive: { [Op.ne]: "2" } }, required: false },
          { model: lessonquiz, where: { isActive: { [Op.ne]: "2" } }, required: false},
        ],
      });
      console.log(courseById);
      if (courseById) {
        return res.status(200).json({
          message: "Course Data",
          Data: courseById,
        });
      } else {
        return res.status(404).json({
          message: "Course Data Not Found",
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

//! Get Only Course Data and Not Pathway from Grade

async function getOnlyCourse(req, res) {
  try {
    const { Grade } = req.query;
    const { QCategory } = req;
    const Page = req.query.Page ? req.query.Page : 1;
    // console.log(`---------------`);
    // console.log(Page);
    const pageSize = 5; //! Limit upto which we can send data
    const offset = (parseInt(Page) - 1) * pageSize; //! Skip the amount of data after every page number change
    // console.log(typeof offset);
    if (!Grade && !QCategory) {
      const completeData = await CourseModel.findAll({
        where: { isActive: { [Op.ne]: "2" } },
        offset: offset,
        limit: pageSize,
      });
      res.status(200).json({
        message: "Course Data",
        Data: completeData,
      });
    } else {
      const whereCondition = {};
      if (Grade) {
        whereCondition.courseGrade = { [Op.like]: `%${Grade}%` };
      }
      if (QCategory) {
        whereCondition.courseCategory = { [Op.like]: `%${QCategory}%` };
      }
      const filteredData = await CourseModel.findAll({
        where: whereCondition,
        isActive: { [Op.ne]: "2" },
        offset: offset,
        limit: pageSize,
      });
      res.status(200).json({
        message: "Course Data",
        Data: filteredData,
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

//! Fetching Category using Query (NON - PARAMs)

async function getCatgeoryQuery(req, res, next) {
  try {
    const { Category } = req.query;
    if (!Category) {
      next();
    } else {
      const findMatchingCat = await CourseCategory.findOne({
        where: { CategoryName: Category },
      });
      // console.log(findMatchingCat);
      if (findMatchingCat) {
        req.QCategory = findMatchingCat.CourseCategoryID;
        next();
      } else {
        next();
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

//! Http data to feed certificate after course completion

async function getCertificateImage(req, res) {
  try {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(404).json({
        message: "course not found",
      });
    } else {
      const courseData = await CourseModel.findByPk(courseId);
      if (courseData) {
        const certificateImage = await courseData.certificateImage;
        return res.status(200).json({
          certificateImage: certificateImage,
        });
      } else {
        return res.status(404).json({
          message: "course not found",
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
//! Http data to feed certificate after course completion --Ends-->>

//! Http data to feed lesson badge after lessons completion --Ends-->>

async function getLessonBadgeImage(req, res) {
  try {
    const { LessonId } = req.query;
    if (!LessonId) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    } else {
      const lessonData = await lessonbadge.findAll({
        where: { LessonID: LessonId },
      });
      let lessonBadgeArray = [];
      if (lessonData && lessonData.length > 0) {
        await Promise.all(
          await lessonData.map(async (singleBadge) => {
            let lessonBadgeObj = {};
            lessonBadgeObj.badgeTitle = singleBadge.Title;
            lessonBadgeObj.badgeImage = singleBadge.LessonBadgeImage;
            await lessonBadgeArray.push(lessonBadgeObj);
          })
        );
        return res.status(200).json({
          badgeImage: lessonBadgeArray,
        });
      } else {
        return res.status(200).json({
          badgeImage: lessonBadgeArray,
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
//! Http data to feed lesson badge after lessons completion --Ends-->>

//! Http to get course title and trophy title
async function getTitleCourseTrophy(req, res) {
  try {
    const { CourseId } = req.query;
    if (!CourseId) {
      return res.status(404).json({
        message: "No course Found",
      });
    } else {
      const courseData = await CourseModel.findByPk(CourseId);
      const lessonDescData = await lessonportfolio.findOne({
        where: { courseId: CourseId },
      });

      return res.status(200).json({
        courseTitle: courseData?.courseTitle,
        trophyTitle: courseData?.trophyTitle,
        lessonDesc: lessonDescData?.Description,
      });
    }
  } catch (error) {}
}

module.exports = {
  getCourseData,
  getCourseCategoryByID,
  getAllCourseDataByID,
  getAllCourseDataByID_http,
  getCourseDataBySingleId,
  getOnlyCourse,
  getCatgeoryQuery,
  getCertificateImage,
  getLessonBadgeImage,
  getTitleCourseTrophy,
};

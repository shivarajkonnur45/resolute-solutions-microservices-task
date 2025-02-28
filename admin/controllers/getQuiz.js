const { lessonquiz } = require("../models/index");

async function getQuizCounts(req, res) {
  try {
    const { lessonArr } = req.query;
    console.log(lessonArr);
    const parseLessonArr = JSON.parse(lessonArr);
    let lessonQuizCount = 0;
    for (let i = 0; i < parseLessonArr.length; i++) {
      const lessonQuizFound = await lessonquiz.findOne({
        where: { LessonID: parseLessonArr[i] },
      });
      if (lessonQuizFound) {
        lessonQuizCount = lessonQuizCount + 1;
      }
    }

    return res.status(200).json({
      lessonQuizCount: lessonQuizCount
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

module.exports = getQuizCounts;

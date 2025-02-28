const db = require("../models/index");
const { Op } = require("sequelize");

async function dateTimeValidatorFlow(req, res, next) {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }
    const result = req.body;

    if (!result) {
      return res.status(404).json({
        message: "No Plan found",
      });
    }

    const createDayCondition = (day) => ({
      [Op.or]: [
        { [day]: { [Op.between]: [result[day], result[`${day}End`]] } },
        {
          [Op.and]: [
            { [day]: { [Op.gte]: result[day] } },
            { [day]: { [Op.lte]: result[`${day}End`] } },
          ],
        },
      ],
    });

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const whereCondition = {
      [Op.or]: days.map(createDayCondition),
    };


    whereCondition.StudentID = AccDetails.UserID;
    whereCondition.ParentID = AccDetails.ParentID;

    whereCondition.IsActive = {
      [Op.in]: ["1", "3"],
    };

    whereCondition.StartDate = {
      [Op.gte]: result.StartDate,
    };

    const courseAligned = await db.flow.findOne({
      where: whereCondition,
    });

    if(courseAligned){
      return res.status(406).json({
        message:"You already have other course lined up",
        courseTitle : courseAligned.Courses
      })
    }

   next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

module.exports = dateTimeValidatorFlow;

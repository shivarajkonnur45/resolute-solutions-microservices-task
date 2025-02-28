const db = require("../models/index.js");
const Sequelize = require("sequelize");
const axios = require("axios");
const sqsValidator = require("../middleware/sq_request_send.js");

// const add_parent = async (req, res) => {
//     // return res.status(400).send(req.body);
//     try {
//         var MessageBody = {
//             type:'add_parent',
//             data: req.body
//         }
//        await sqsValidator.clientlient(MessageBody);
//         return res.status(200).json({
//             message: "Parent addedd successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }

// const update_parent = async (req, res) => {
//     //return res.status(400).send(req.body);
//     try {
//         var MessageBody = {
//             type:'update_parent',
//             data: req.body
//         }
//         await sqsValidator.clientlient(MessageBody);
//         return res.status(200).json({
//             message: "Parent updated successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }

// const get_parent = async (req, res) => {
//     try {
//         const response = await axios.get(process.env.HTTP_REQUEST_CLIENTLIENT+'/profile/get-profile-http/'+req.params.UserID, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`
//             }
//         });
//         res.status(200).json(response.data)
//     } catch (error) {
//         res.status(500).json({
//             message: "Sorry! there was server-side error",
//             error : error.message
//         })
//     }
// }

// const delete_parent = async (req, res) => {
//     try {
//         var MessageBody = {
//             type:'delete_parent',
//             data: req.params
//         }
//         await sqsValidator.clientlient(MessageBody);
//         return res.status(200).json({
//             message: "Parent deleted successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }

// PARENT HTTP REQUEST
const add_parent_http = async (req, res) => {
  try {
    // console.log(true);
    const parent = req.body;
    const response = await axios.post(
      process.env.HTTP_REQUEST_CLIENTLIENT + "/parent/add",
      { parent },
      {
        headers: {
          Authorization: `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
        },
      }
    );

    return res.status(response.status).json({
      message: "Parent Added successfully",
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response);
      res.status(error.response.status).json({
        message: error.response.data.message,
      });
    }
  }
};

const get_parent_http = async (req, res) => {
  try {
    const token = process.env.HTTP_REQUEST_SECRET_KEY;
    const response = await axios.get(
      process.env.HTTP_REQUEST_CLIENTLIENT +
        "/parent/getParentById/" +
        req.params.UserID,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Parent Not Exsist",
      error: error.message,
    });
    console.log(error);
  }
};

const update_parent_http = async (req, res) => {
  try {
    const parent = req.body;
    const id = req.params.UserID;
    const response = await axios.put(
      process.env.HTTP_REQUEST_CLIENTLIENT + "/parent/update/" + id,
      { parent },
      {
        headers: {
          Authorization: `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
        },
      }
    );
    return res.status(200).json({
      message: "parent Update successfully",
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response);
      res.status(error.response.status).json({
        message: error.response.data.message,
      });
    } else {
      console.log(error);
    }
  }
};

const delete_parent_http = async (req, res) => {
  try {
    const parent = req.body;
    const id = req.params.UserID;
    const response = await axios.delete(
      process.env.HTTP_REQUEST_CLIENTLIENT + "/parent/delete/" + id,
      {
        headers: {
          Authorization: `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
        },
      }
    );
    return res.status(200).json({
      message: "parent Delete successfully",
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response);
      res.status(error.response.status).json({
        message: error.response.data.message,
      });
    } else {
      console.log(error);
    }
  }
};

async function isInterestedCourse(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID || !AccDetails.uniqueID) {
      return res.status(400).json({
        message: "Invalid Token! Login again",
      });
    }
    const { courseID, courseName, courseGrade } = req.query;
    if (!courseID || !courseName || !courseGrade) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    await db.CourseInterested.create({
      uniqueID: AccDetails.uniqueID,
      UserID: AccDetails.UserID,
      CourseID: courseID,
      courseGrade: courseGrade,
      CreatedBy: AccDetails?.FirstName + " " + AccDetails?.LastName,
      CourseName: courseName,
    });
    return res.status(200).json({
      message: "You are narked interested for this course!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function getInterestedCourseListParent(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID || !AccDetails.uniqueID) {
      return res.status(400).json({
        message: "Invalid Token! Login again",
      });
    }
    const listOfInterestedCourse = await db.CourseInterested.findAll({
      where: {
        uniqueID: AccDetails.uniqueID,
        UserID: AccDetails.UserID,
      },
      attributes: ["CourseID"],
    });

    const onlyArr = listOfInterestedCourse.map((i) => i.dataValues.CourseID);
    return res.status(200).json({
      courseInterest: onlyArr,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function getInterestedListAdmin(req, res) {
  try {
    const allInterestedData = await db.CourseInterested.findAll({});
    let toSendCourseData = [{}];
    allInterestedData.map((interested) => {
      if (
        !toSendCourseData[0][`${interested.CourseName}+${interested.CourseID}`]
      ) {
        toSendCourseData[0][
          `${interested.CourseName}+${interested.CourseID}`
        ] = 1;
      } else {
        toSendCourseData[0][
          `${interested.CourseName}+${interested.CourseID}`
        ] += 1;
      }
    });
    return res.status(200).json({
      interestOverview: toSendCourseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

module.exports = {
  // add_parent,
  // update_parent,
  get_parent_http,
  // delete_parent
  // get_parent,
  add_parent_http,
  update_parent_http,
  delete_parent_http,
  isInterestedCourse,
  getInterestedCourseListParent,
  getInterestedListAdmin,
};

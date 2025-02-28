const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
const db = require("../models/index");
const Sequelize = require("sequelize");
const nodemailer = require("nodemailer");
const notificationBody = require("../notifcationStructure/notificationStruct");
const domainNames = require("../Data/domain");
const { Op } = require("sequelize");

// const {sendFCMNotification} = require("../middleware/notification");
// const { signUpSchema } = requiere('../helper/validation');

const addstudent = async (req, res, next) => {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid Token Login Again",
      });
    }
    const { Email } = req.body;

    const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
    const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);

    const emailExist = await db.useremail.findOne({
      where: {
        Email: originalEmail,
      },
    });

    if (emailExist) {
      res.status(404).json({
        message: "Email already exits",
      });
    } else {
      try {
        const newUser = await db.user.create({
          Grade: req.body.Grade,
          FirstName: req.body.FirstName,
          LastName: req.body.LastName,
          Email: Email,
          Password: req.body.Password,
          PhoneNumber: req.body.PhoneNumber,
          IsParticipateCompetitions: req.body.IsParticipateCompetitions,
          IsNoSuPeAchPoQu: req.body.IsNoSuPeAchPoQu,
          IsLookFeedback: req.body.IsLookFeedback,
          IsActive: 0,
          CreatedBy: req.AccDetails.FirstName + " " + req.AccDetails.LastName,
          LastModifiedBy:
            req.AccDetails.FirstName + " " + req.AccDetails.LastName,
          AccountType: 1,
          ParentID: req.AccDetails.UserID,
        });

        // //---Student history table-------------------------------------------//
        // const UserIDWiseData = await db.user.findOne({
        //     where: { UserID: req.params.UserID },
        // });

        // if (!UserIDWiseData) {
        //     return res
        //         .status(400)
        //         .send({
        //             ErrorCode: "REQUEST",
        //             message: "Student Data not found",
        //         });
        // }
        // const CreateUserHistoryData = await db.UserHistory.create(
        //     UserIDWiseData.dataValues
        // );
        // if (!CreateUserHistoryData) {
        //     return res
        //         .status(400)
        //         .send({
        //             ErrorCode: "REQUEST",
        //             message: "Student Data Not insert in History Table",
        //         });
        // }
        // //-------------------------------------------------------------------//
        await db.useremail.create({
          UserID: newUser.UserID,
          Email: originalEmail,
        });

        // Notification Body >>
        notificationBody.userId = newUser.UserID;
        notificationBody.notificationTitle = `Welcome ${req.body.FirstName}, You are onboard!`;
        notificationBody.userEmailReq = originalEmail;
        notificationBody.emailType = "student-created";
        notificationBody.deviceToken = req?.body?.deviceToken;
        notificationBody.concurrentBlock = "signInParent"; // Block on spot notification send and schedule it
        notificationBody.parentId = AccDetails.UserID;

        req.visualNotificationBody = notificationBody;
        // Notification Body <<

        next(); // Add Visual Notifications to table

        return res.status(200).json({
          message: "Student addedd successfully",
        });
      } catch (error) {
        return res.status(500).json({
          message: "Failed to add student",
          error: error.message, // You can customize this message based on your error handling needs
        });
      }
    }
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const get_student = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        ParentID: req.AccDetails.UserID,
        AccountType: 1,
      },
    });
    if (!userExist) {
      return res.status(404).json({
        message: "Student not exits",
      });
    }
    res.status(200).json({
      message: "Student Data",
      data: userExist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const update_student = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        ParentID: req.AccDetails.UserID,
        AccountType: "1",
      },
    });

    if (!userExist) {
      return res.status(404).json({
        message: "Student do not exist",
      });
    }

    //--- Student history table-------------------------------------------//
    if (userExist) {
      const UserIDWiseData = await db.user.findOne({
        where: { UserID: req.params.UserID },
      });

      if (!UserIDWiseData) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Student Data not found",
        });
      }
      const CreateUserHistoryData = await db.UserHistory.create(
        UserIDWiseData.dataValues
      );
    }
    try {
      const bytesEmail = await cryptoJS.AES.decrypt(
        req.body.Email,
        process.env.SECRET
      );
      const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);

      const alreadyExistEmail = await db.useremail.findOne({
        where: { Email: originalEmail },
      });

      if (alreadyExistEmail) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Email already exist!",
        });
      }
      var data = {
        Grade: req.body.Grade,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        PhoneNumber: req.body.PhoneNumber,
        IsParticipateCompetitions: req.body.IsParticipateCompetitions,
        IsNoSuPeAchPoQu: req.body.IsNoSuPeAchPoQu,
        IsLookFeedback: req.body.IsLookFeedback,
        IsActive: req.body.IsActive,
        CreatedBy: req.AccDetails.FirstName + " " + req.AccDetails.LastName,
        LastModifiedBy:
          req.AccDetails.FirstName + " " + req.AccDetails.LastName,
        AccountType: 1,
        ParentID: req.AccDetails.UserID,
        Email: req.body.Email,
      };

      if (req.body.Password) {
        if (req.body.Password != "") {
          data.Password = req.body.Password;
        }
      }
      await db.user.update(data, { where: { UserID: req.params.UserID } });
      await db.useremail.update(
        {
          UserID: req.params.UserID,
          Email: originalEmail,
          IsActive: "1",
        },
        { where: { UserID: req.params.UserID } }
      );
      return res.status(200).json({
        message: "Student updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to update student",
        error: error.message, // You can customize this message based on your error handling needs
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const delete_studnet = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        ParentID: req.AccDetails.UserID,
        AccountType: 1,
      },
    });

    //--- Student history table-------------------------------------------//
    if (userExist) {
      const UserIDWiseData = await db.user.findOne({
        where: { UserID: req.params.UserID },
      });

      if (!UserIDWiseData) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Student Data not found",
        });
      }
      const CreateUserHistoryData = await db.UserHistory.create(
        UserIDWiseData.dataValues
      );
      if (!CreateUserHistoryData) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Student Data Not insert in History Table",
        });
      }
    }
    //-------------------------------------------------------------------//

    if (!userExist) {
      return res.status(404).json({
        message: "Student not exits",
      });
    }
    try {
      await db.user.update(
        {
          IsActive: 2,
        },
        { where: { UserID: req.params.UserID } }
      );

      await db.useremail.update(
        {
          IsActive: "2",
        },
        { where: { UserID: req.params.UserID } }
      );
      return res.status(200).json({
        message: "Student deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete student",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const get_all_student = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const filter = req.query.filter || "";
    const whereClause = {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.or]: [
            { UserID: { [Sequelize.Op.like]: `%${filter}%` } },
            { FirstName: { [Sequelize.Op.like]: `%${filter}%` } },
            { LastName: { [Sequelize.Op.like]: `%${filter}%` } },
            { Email: { [Sequelize.Op.like]: `%${filter}%` } },
            { PhoneNumber: { [Sequelize.Op.like]: `%${filter}%` } },
          ],
        },
        {
          ParentID: req.AccDetails.UserID,
          AccountType: 1,
        },
        { IsActive: { [Sequelize.Op.ne]: "2" } },
      ],
    };

    const countTotal = await db.user.count({ where: { ...whereClause } });
    const totalPages = Math.ceil(countTotal / limit);

    const data = await db.user.findAll({
      limit,
      offset,
      where: whereClause,
      order: [["UserID", "DESC"]],
    });
    return res.status(200).json({
      totalAllData: countTotal,
      totalRows: data.length,
      totalPages: totalPages,
      page: page,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

async function getStudentForParent(req, res) {
  try {
    let ParentId = req.params.ParentID;
    if (!ParentId) {
      ParentId = 1;
    } else {
      const getDataForParent = await db.user.findAll({
        where: { ParentID: ParentId },
      });
      res.status(200).json({
        message: "Parent Data",
        Data: getDataForParent,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
}
async function get_student_token(req, res) {
  try {
    const id = parseInt(req.params.UserID);
    const { AccDetails } = req;
    // console.log(AccDetails.AccountType);
    if (AccDetails.AccountType != 3) {
      return res
        .status(404)
        .json({ message: "Login With Parent Email And Password." });
    }

    const getAllStudentOfParent = await db.user.findAll({
      where: { ParentID: AccDetails.UserID, UserID: id },
    });

    const userIds = getAllStudentOfParent.map((user) => user.UserID);

    if (!userIds.includes(id)) {
      return res.status(404).json({ message: "Student not found." });
    }

    const token = await jwt.sign(
      { accountDetail: getAllStudentOfParent },
      process.env.JWT_SECRET
    );
    res.status(200).json({
      message: "Token Generate Successfully",
      userToken: token,
      data: getAllStudentOfParent,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function get_student_flow(req, res) {
  try {
    const { AccDetails } = req;
    const id = AccDetails[0].UserID;

    const { startDate, endDate } = req.query;

    let filterConditions = {
      StudentID: id,
    };

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
      StudentID: id,
    });
    if (!FlowData || FlowData.length === 0) {
      return res.status(404).json({ message: "Student Flow Data not found" });
    }

    return res.status(200).json({ message: FlowData });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
}

async function get_student_course(req, res) {
  try {
    const { AccDetails } = req;
    const id = AccDetails[0].UserID;

    const { startDate, endDate } = req.query;

    let filterConditions = {
      StudentID: id,
    };

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
      StudentID: id,
    });

    const allFlowIDs = FlowData.map((flow) => flow.FlowID);

    const course = await Promise.all(
      await allFlowIDs.map(async (getCourse) => {
        const StudentCourseData = await db.flowcoures.findOne({
          where: { FlowID: getCourse },
        });
        return StudentCourseData;
      })
    );

    if (!FlowData || FlowData.length === 0) {
      return res.status(404).json({ message: "Student Flow Data not found" });
    }

    return res.status(200).json({ message: course });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
}

// Student Invite
const StudentInvite = async (req, res) => {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid Token Login Again",
      });
    }
    // console.log(AccDetails.UserID);
    if (!AccDetails.TotalInvites || AccDetails.TotalInvites <= 0) {
      return res.status(400).json({
        message: "You have reached your limit for invite",
        inviteStatus: 0,
      });
    }

    const emailjson = JSON.parse(req.body.email);
    const checkHash = new Map(); // Creating an hash map

    async function decryptEmails(emailjson) {
      // Parse the JSON string into a JavaScript object
      const emailArray = emailjson;
      const ReqdataEmails = emailArray.map((item) => {
        const bytesEmail = cryptoJS.AES.decrypt(item.email, process.env.SECRET);
        const originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);
        const hashFound = checkHash.get("isContain");

        if (originalEmail && hashFound == undefined) {
          const emailArr = originalEmail.split("@");
          if (emailArr && emailArr.length > 0) {
            const genericPart = emailArr[emailArr.length - 1];
            if (domainNames.includes(genericPart)) {
              checkHash.set("isContain", genericPart);
            }
          }
        }
        return originalEmail;
      });

      if (await checkHash.get("isContain")) {
        return res.status(400).json({
          message:
            "Your email consist of generic email! Remove it to move forward.",
        });
      }

      const { Op } = require("sequelize");
      const usersExist = await db.useremail.findAll({
        where: {
          Email: {
            [Op.in]: ReqdataEmails,
          },
        },
      });
      const ResEmail = usersExist.map((item) => item.dataValues);
      const resEmails = ResEmail.map((item) => item.Email);
      const filteredReqdata = ReqdataEmails.filter(
        (email) => !resEmails.includes(email)
      );

      if (filteredReqdata.length > 0) {
        if (filteredReqdata.length > AccDetails.TotalInvites) {
          return res.status(400).json({
            message: "You cannot exceed your limit for invite",
            inviteStatus: 0,
          });
        }

        if (filteredReqdata == []) {
          return res.status(400).json({
            message: "Already exists",
            error: error.message,
          });
        }

        function generatePassword() {
          const length = 12;
          const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
          let password = "";
          for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
          }
          return password;
        }

        async function createUserAndSendEmail(email, req, res) {
          try {
            const password = generatePassword();
            const StudentloginURL = "https://dev.edbition.com/user_login";
            const transporter = nodemailer.createTransport({
              service: "zoho",
              auth: {
                user: process.env.EMAILUSER,
                pass: process.env.EMAILPASSWORD,
              },
            });

            // Function to send email to each user
            const mailOptions = {
              from: process.env.EMAILUSER,
              to: email,
              subject: "Invitation",
              text: `Login URL: ${StudentloginURL}\nEmailID: ${email}\nPassword: ${password}`,
            };

            await transporter.sendMail(mailOptions);

            var SSKK = process.env.SECRET;

            const encryptpass = (Passencypty, SSKK) => {
              return cryptoJS.AES.encrypt(Passencypty, SSKK).toString();
            };

            // Extract the first part of the email before '@'
            const extractFirstName = (email) => {
              return email.split("@")[0];
            };

            // Extract first name from email
            const firstNameFromEmail = extractFirstName(email);

            const newUser = await db.user.create({
              CreatedBy:
                req.AccDetails.FirstName + " " + req.AccDetails.LastName,
              LastModifiedBy:
                req.AccDetails.FirstName + " " + req.AccDetails.LastName,
              Email: encryptpass(email, SSKK),
              FirstName: firstNameFromEmail,
              LastName: "",
              Password: encryptpass(password, SSKK),
              AccountType: 3,
              IsActive: 0,
              ParentID: req.AccDetails.UserID,
              CompanyID: req.AccDetails.UserID,
            });

            await db.useremail.create({
              UserID: newUser.UserID,
              Email: email,
            });

            await db.freezeInvite.create({
              userId: newUser.UserID,
              userEmail: email,
              companyId: req.AccDetails.UserID,
            });
          } catch (error) {
            console.log(`Error processing email ${email}: ${error}`);
            throw error; // Rethrow the error to handle it in the main function
          }
        }

        async function processUsers(req, res) {
          try {
            await Promise.all(
              filteredReqdata.map((email) =>
                createUserAndSendEmail(email, req, res)
              )
            );
            await db.Subscription.update(
              { SubscriptionCount: filteredReqdata.length },
              { where: { CompanyID: AccDetails.UserID } }
            );

            if (AccDetails.TotalInvites > 0) {
              const toRemove = filteredReqdata.length;
              await db.user.update(
                {
                  TotalInvites: db.sequelize.literal(
                    `TotalInvites - ${toRemove}`
                  ),
                },
                { where: { UserID: AccDetails.UserID } }
              );
            }
            return res.status(200).json({
              message: "Students added successfully",
            });
          } catch (error) {
            return res.status(500).json({
              message: `Error processing users: ${error.message}`,
            });
          }
        }
        processUsers(req, res);
      } else {
        res.status(400).json({
          message: "Email is already exist!",
        });
      }
    }
    // Example call to the function
    decryptEmails(emailjson);
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const StudentInviteList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const filter = req.query.filter || "";
    //const status = parseInt(req.query.status);
    const status = req.query.status; // Assuming the status parameter comes from the query string

    const isActiveCondition =
      status !== undefined
        ? { IsActive: status } // Use the provided status value
        : { IsActive: { [Sequelize.Op.in]: [0, 1] } }; // Default to [0, 1] if no parameter is provided
    const whereClause = {
      [Sequelize.Op.and]: [
        {
          [Sequelize.Op.or]: [
            { FirstName: { [Sequelize.Op.like]: `%${filter}%` } },
            { LastName: { [Sequelize.Op.like]: `%${filter}%` } },
            { Email: { [Sequelize.Op.like]: `%${filter}%` } },
            { PhoneNumber: { [Sequelize.Op.like]: `%${filter}%` } },
          ],
        },
        {
          ParentID: req.AccDetails.UserID,
          AccountType: 3,
          IsActive: { [Sequelize.Op.not]: 2 },
          ...isActiveCondition,
        },
      ],
    };

    const countTotal = await db.user.count({ where: { ...whereClause } });
    const totalPages = Math.ceil(countTotal / limit);

    const data = await db.user.findAll({
      limit,
      offset,
      where: whereClause,
      order: [["UserID", "DESC"]],
      raw: true,
    });

    const userForFreeze = await db.freezeInvite.findAll({
      where: { companyId: req.AccDetails.UserID },
      attributes: ["userId"],
      raw: true,
    });

    // console.log(userForFreeze);
    for (let i = 0; i < data.length; i++) {
      const user = userForFreeze.find((user) => user.userId === data[i].UserID);
      if (user) {
        data[i]["isOnFreeze"] = 1;
      } else {
        data[i]["isOnFreeze"] = 0;
      }
    }

    return res.status(200).json({
      totalAllData: countTotal,
      totalRows: data.length,
      totalPages: totalPages,
      page: page,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const StudentInviteByID = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        //ParentID: req.AccDetails.UserID,
        AccountType: 3,
        IsActive: { [Sequelize.Op.not]: 2 },
      },
    });
    if (!userExist) {
      return res.status(404).json({
        message: "Student not exits",
      });
    }
    res.status(200).json({
      message: "Student Data",
      data: userExist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const StudentInviteEdit = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        ParentID: req.AccDetails.UserID,
        AccountType: 3,
        IsActive: { [Sequelize.Op.not]: 2 },
      },
    });
    if (!userExist) {
      return res.status(404).json({
        message: "Student not exits",
      });
    }
    try {
      var data = {
        Grade: req.body.Grade,
        FirstName: req.body.FirstName,
        LastName: req.body.LastName,
        PhoneNumber: req.body.PhoneNumber,
        IsParticipateCompetitions: req.body.IsParticipateCompetitions,
        IsNoSuPeAchPoQu: req.body.IsNoSuPeAchPoQu,
        IsLookFeedback: req.body.IsLookFeedback,
        IsActive: req.body.IsActive,
        CreatedBy: req.AccDetails.FirstName + " " + req.AccDetails.LastName,
        LastModifiedBy:
          req.AccDetails.FirstName + " " + req.AccDetails.LastName,
        AccountType: 3,
        ParentID: req.AccDetails.UserID,
      };

      if (req.body.Password) {
        if (req.body.Password != "") {
          data.Password = req.body.Password;
        }
      }
      await db.user.update(data, { where: { UserID: req.params.UserID } });
      res.status(200).json({
        message: "Student updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update student",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const StudentInvite_delete_studnet = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        ParentID: req.AccDetails.UserID,
        AccountType: 3,
      },
    });

    if (userExist) {
      const UserIDWiseData = await db.user.findOne({
        where: { UserID: req.params.UserID },
      });

      if (!UserIDWiseData) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Student Data not found",
        });
      }
      const CreateUserHistoryData = await db.UserHistory.create(
        UserIDWiseData.dataValues
      );
      if (!CreateUserHistoryData) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Student Data Not insert in History Table",
        });
      }
    }

    if (!userExist) {
      return res.status(404).json({
        message: "Student not exits",
      });
    }
    try {
      await db.user.update(
        {
          IsActive: 2,
        },
        { where: { UserID: req.params.UserID } }
      );
      res.status(200).json({
        message: "Student deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete student",
        error: error.message, // You can customize this message based on your error handling needs
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

async function inviteCount(req, res) {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid Token Login Again",
      });
    }

    const companyData = await db.user.findByPk(AccDetails.UserID);
    if (!companyData) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const inviteCountData = companyData.TotalInvites;

    return res.status(200).json({
      totalInvites: inviteCountData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}
const StudentInviteResend = async (req, res) => {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid Token Login Again",
      });
    }
    const emailjson = JSON.parse(req.body.email);
    async function decryptEmails(emailjson) {
      // Parse the JSON string into a JavaScript object
      const emailArray = emailjson;
      const ReqdataEmails = emailArray.map((item) => {
        const bytesEmail = cryptoJS.AES.decrypt(item.email, process.env.SECRET);
        const originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);
        return originalEmail;
      });

      var emailString = ReqdataEmails.join();

      const Useremail = await db.useremail.findAll({
        where: { Email: emailString },
      });
      const ForEmailuserID = Useremail[0].dataValues.UserID;

      const userExist = await db.user.findOne({
        where: {
          UserID: ForEmailuserID,
        },
      });

      const { Op } = require("sequelize");
      const usersExist = await db.useremail.findAll({
        where: {
          Email: {
            [Op.in]: ReqdataEmails,
          },
        },
      });
      const ResEmail = usersExist.map((item) => item.dataValues);
      const resEmails = ResEmail.map((item) => item.Email);
      const filteredReqdata = ReqdataEmails.filter(
        (email) => !resEmails.includes(email)
      );

      const Decpass = cryptoJS.AES.decrypt(
        userExist.dataValues.Password,
        process.env.SECRET
      );
      const DecpassFinal = Decpass.toString(cryptoJS.enc.Utf8);

      //if (filteredReqdata.length > 10) {

      if (filteredReqdata.length > AccDetails.TotalInvites) {
        return res.status(400).json({
          message: "You cannot exceed your limit for invite",
          inviteStatus: 0,
        });
      }

      if (filteredReqdata == []) {
        return res.status(400).json({
          message: "Already exists",
          error: error.message,
        });
      }

      function generatePassword() {
        const length = 12;
        const charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
          password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
      }

      //async function createUserAndSendEmail(email, req, res) {
      try {
        const password = generatePassword();
        const StudentloginURL = "https://dev.edbition.com/user_login";
        const transporter = nodemailer.createTransport({
          service: "zoho",
          auth: {
            user: process.env.EMAILUSER,
            pass: process.env.EMAILPASSWORD,
          },
        });

        // Function to send email to each user
        const mailOptions = {
          from: process.env.EMAILUSER,
          to: emailString,
          subject: "Invitation",
          text: `Login URL: ${StudentloginURL}\nEmailID: ${emailString}\nPassword: ${DecpassFinal}`,
        };

        await transporter.sendMail(mailOptions);

        //var SSKK = process.env.SECRET;

        const encryptpass = (Passencypty, SSKK) => {
          return cryptoJS.AES.encrypt(Passencypty, SSKK).toString();
        };
      } catch (error) {
        console.log(`Error processing email ${emailString}: ${error}`);
        throw error; // Rethrow the error to handle it in the main function
      }
      //}

      async function processUsers(req, res) {
        try {
          await Promise.all(
            filteredReqdata.map((email) =>
              createUserAndSendEmail(email, req, res)
            )
          );
          if (AccDetails.TotalInvites > 0) {
            const toRemove = filteredReqdata.length;
            await db.user.update(
              {
                TotalInvites: db.sequelize.literal(
                  `TotalInvites - ${toRemove}`
                ),
              },
              { where: { UserID: AccDetails.UserID } }
            );
          }

          await db.freezeInvite.create({
            userId: ForEmailuserID,
            userEmail: emailjson[0].email,
            companyId: AccDetails.UserID,
          });

          return res.status(200).json({
            message: "Resent successfully",
          });
        } catch (error) {
          return res.status(500).json({
            message: `Error processing users: ${error.message}`,
          });
        }
      }
      processUsers(req, res);
      // } else {
      //     res.status(400).json({
      //         message: "Email is already exist!"
      //     })
      // }
    }
    // Example call to the function
    decryptEmails(emailjson);
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const get_all_student_admin = async (req, res) => {
  try {
    const allStudents = await db.user.findAll({
      where: { AccountType: 1, IsActive: 1 },
      attributes: ["UserID", "FirstName", "LastName"],
    });

    return res.status(200).json({
      studentList: allStudents,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! there was server-side error",
    });
  }
};

async function studentOverAllCount(req, res) {
  try {
    const { searchQuery } = req.query;

    if (!searchQuery || searchQuery == "undefined") {
      const overAllUserCount = await db.user.findAndCountAll({
        where: { IsActive: { [Op.in]: [0, 1] } },
      });
      const overAllStudent = await db.user.findAndCountAll({
        where: { AccountType: 1, IsActive: { [Op.in]: [0, 1] } },
      });

      return res.status(200).json({
        overAllUserCount: overAllUserCount.count,
        overAllStudent: overAllStudent.count,
      });
    }

    const intQuery = parseInt(searchQuery);
    console.log(intQuery);

    if (intQuery == 3) {
      const overAllUserCount = await db.user.findAndCountAll({
        where: { AccountType: intQuery, IsActive: { [Op.in]: [0, 1] } },
      });

      const overAllStudent = await db.user.findAndCountAll({
        where: { AccountType: 1, IsActive: { [Op.in]: [0, 1] } },
      });

      return res.status(200).json({
        overAllUserCount: overAllUserCount.count,
        overAllStudent: overAllStudent.count,
      });
    }

    const overAllUserCount = await db.user.findAndCountAll({
      where: { AccountType: intQuery, IsActive: { [Op.in]: [0, 1] } },
    });

    return res.status(200).json({
      overAllUserCount: overAllUserCount.count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function getUserEmail(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const userEmailData = await db.useremail.findOne({
      where: { UserID: userId, IsActive: { [Op.ne]: "2" } },
    });
    if (!userEmailData) {
      return res.status(200).json({
        statusEmail: 0,
      });
    }
    return res.status(200).json({
      statusEmail: 1,
      Data: userEmailData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function resetPasswordUser(req, res) {
  try {
    const { uId, uuId, rn } = req.query;
    const { password } = req.body;

    if (!uId || !uuId || !rn || !password) {
      return res.status(400).json({
        message: "User not found or Invalid Arguments",
      });
    }

    const isReadyForUpdate = await db.resetPassword.findOne({
      where: {
        userId: uId,
        userUniqueId: uuId,
        randomValidator: rn,
      },
    });

    if (!isReadyForUpdate) {
      return res.status(404).json({
        message: "Session Expired",
        status: 0,
      });
    }

    const whereCondition = {};

    whereCondition.UserID = uId;
    whereCondition.uniqueID = uuId;
    whereCondition.IsActive = { [Op.in]: [0, 1] };

    const userData = await db.user.findOne({
      where: whereCondition,
    });

    if(!userData){
      return res.status(404).json({
        message:"User not found!"
      })
    }

    const decryptPassDb = cryptoJS.AES.decrypt(
      userData.Password,
      process.env.SECRET
    );

    const decryptPassDbMain = decryptPassDb.toString(cryptoJS.enc.Utf8);

    const decryptPassUser = cryptoJS.AES.decrypt(
      password,
      process.env.SECRET
    );

    const decryptPassUserMain = decryptPassUser.toString(cryptoJS.enc.Utf8);

    if(decryptPassDbMain == decryptPassUserMain){
      return res.status(403).json({
        message:"The new password cannot be the same as the current password. Please choose a different password."
      })
    }

    const userExist = await db.user.update(
      { Password: password },
      {
        where: whereCondition,
      }
    );

    if (userExist[0] == 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    await db.resetPassword.destroy({
      where: {
        userId: uId,
        userUniqueId: uuId,
        randomValidator: rn,
      },
    });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

module.exports = {
  addstudent,
  get_student,
  update_student,
  delete_studnet,
  get_all_student,
  getStudentForParent,
  get_student_token,
  get_student_flow,
  get_student_course,
  get_all_student_admin,

  inviteCount,
  StudentInvite,
  StudentInviteList,
  StudentInviteByID,
  StudentInviteEdit,
  StudentInvite_delete_studnet,
  StudentInviteResend,
  studentOverAllCount,
  getUserEmail,
  resetPasswordUser,
};

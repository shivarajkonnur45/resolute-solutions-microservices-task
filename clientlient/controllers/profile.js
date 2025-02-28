const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
const db = require("../models/index");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const SibApiV3Sdk = require("sib-api-v3-sdk");
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "";
// const { signUpSchema } = require('../helper/validation');

const get_profile = async (req, res) => {
  try {
    const { AccDetails } = req;
    const userExist = await db.user.findOne({
      where: {
        UserID: req.AccDetails.UserID,
      },
    });
    if (!userExist) {
      return res.status(404).json({
        message: "Profile not exits",
      });
    }
    res.status(200).json({
      message: "Profile Data",
      data: userExist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error 11",
      error: error.message,
    });
  }
};

const update_profile = async (req, res) => {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid token! Login again",
      });
    }

    var data = req.body;
    data.LastModifiedBy =
      req.AccDetails.FirstName + " " + req.AccDetails.LastName;
    data.LastModifiedOn = Sequelize.literal("CURRENT_TIMESTAMP");

    if (req.body.Password) {
      if (req.body.Password != "") {
        data.Password = req.body.Password;
      }
    }
    try {
      const UserIDWiseData = await db.user.findOne({
        where: { UserID: req.AccDetails.UserID },
      });

      if (!UserIDWiseData) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Student Data not found",
        });
      }

      const bytesEmail = await cryptoJS.AES.decrypt(
        data.Email,
        process.env.SECRET
      );
      const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);

      const existCheck = await db.useremail.findOne({
        where: { UserID: { [Op.ne]: AccDetails.UserID }, Email: originalEmail },
      });

      if (existCheck) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Email already exist!",
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

      await db.user.update(data, { where: { UserID: req.AccDetails.UserID } });
      return res.status(200).json({
        message: "Profile updated",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to update profile",
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

const get_profile_http = async (req, res) => {
  try {
    const whereCondition = {};
    whereCondition.UserID = req.params.UserID;
    whereCondition.IsActive = { [Op.in]: ["0", "1"] };
    const userExist = await db.user.findOne({ where: whereCondition });
    if (userExist) {
      return res.status(200).json({
        message: "Profile Data",
        data: userExist,
      });
    } else {
      return res.status(400).json({ Data: "Profile Data Not Gets!" });
    }
  } catch (error) {
    return res.status(400).send({ ErrorCode: "REQUEST", Error: error });
  }
};

const get_profiles_http = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
      },
    });
    if (!userExist) {
      return res.status(404).json({
        message: "Profile not exits",
      });
    }
    res.status(200).json({
      message: "Profile Data",
      data: userExist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error,
    });
  }
};

const validate_email_http = async (req, res) => {
  try {
    const { Email } = req.params;

    const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
    const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);

    const emailExist = await db.useremail.findOne({
      where: {
        Email: originalEmail,
      },
    });

    if (emailExist) {
      return res.status(404).json({
        message: "Email already exits",
      });
    }

    return res.status(200).json({
      message: "Email not exits",
    });
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const get_http_users = async (req, res) => {
  try {
    const { AccountType } = req.query;
    const { isActive } = req.query;
    const { Search } = req.query;
    const { status } = req.query;
    const Page = req.query.Page ? req.query.Page : 1;

    let pageSize = 5;
    const offset = (parseInt(Page) - 1) * pageSize;

    const whereCondition = { isActive: { [Op.ne]: "2" } };

    if (status && status != "undefined") {
      if (status == "Free Trial") {
        const userFreeTrail = await db.FreeTrail.findAll({
          attributes: ["UserID"],
        });
        const freeTrailUserArr = userFreeTrail.map((u) => u.dataValues.UserID);

        whereCondition.UserID = { [Op.in]: freeTrailUserArr };
      }
    }

    if (AccountType && AccountType != "undefined") {
      whereCondition.AccountType = AccountType;

      // Additional subscription logic added
      if (AccountType == 1 || AccountType == 2) {
        const whereToSearch = AccountType == 1 ? 'ParentID' : 'CompanyID';
        if (status == "Pause" || status == "Unsubscribe") {
          const userSubscription = await db.Subscription.findAll({
            where: { SubscriptionStatus: status == "Pause" ? 0 : 1 },
            attributes: [whereToSearch],
          });
          const userSubscriptionArr = userSubscription.map((u) => u.dataValues[whereToSearch]);

          whereCondition.UserID = { [Op.in]: userSubscriptionArr };
        }
      }
    }
    if (isActive && isActive != "undefined") {
      whereCondition[Op.and] = [
        { isActive: { [Op.eq]: isActive } },
        { isActive: { [Op.ne]: "2" } },
      ];
    }
    if (Search && Search != "undefined") {
      whereCondition[Op.or] = [
        { uniqueID: { [Op.like]: `%${Search}%` } },
        { FirstName: { [Op.like]: `%${Search}%` } },
        { LastName: { [Op.like]: `%${Search}%` } },
      ];
    }
    if (!AccountType && !isActive && !Search) {
      const allData = await db.user.findAll({
        where: { isActive: { [Op.ne]: "2" } },
        offset: offset,
        limit: pageSize,
      });
      const { count } = await db.user.findAndCountAll({
        where: { isActive: { [Op.ne]: "2" } },
      });
      const studentNumber = await db.user.findAndCountAll({
        where: { AccountType: 1, isActive: { [Op.ne]: "2" } },
      });

      //   console.log(`Client count`, count);
      const ifStudentCount = await Promise.all(
        allData.map(async (singleParent) => {
          if (singleParent.AccountType == 3) {
            const allBelongingStudent = await db.user.findAndCountAll({
              where: {
                ParentID: singleParent.UserID,
                IsActive: { [Op.in]: [0, 1] },
              },
            });
            singleParent.dataValues.studentCount = allBelongingStudent.count;
          }
          return singleParent;
        })
      );
      return res.status(200).json({
        message: "Account Data",
        Data: ifStudentCount,
        usrLen: count,
        stuLen: studentNumber.count,
      });
    } else {
      // console.log(offset);
      const allClientSideData = await db.user.findAll({
        where: whereCondition,
        offset: offset,
        limit: pageSize,
      });
      const allClientSideDataWithoutFilter = await db.user.findAll({
        where: whereCondition,
        attributes: ["UserID"],
      });

      const parentArr = allClientSideDataWithoutFilter.map((single) => {
        return single.dataValues.UserID;
      });

      const studentNumber = await db.user.findAndCountAll({
        where: { ParentID: { [Op.in]: parentArr }, isActive: { [Op.ne]: "2" } },
      });

      const { count } = await db.user.findAndCountAll({
        where: whereCondition,
      });
      if (AccountType == 2) {
        for (let i = 0; i < allClientSideData.length; i++) {
          const { count } = await db.user.findAndCountAll({
            where: {
              CompanyID: allClientSideData[i].UserID,
              IsActive: 1,
            },
          });
          allClientSideData[i].dataValues["empCount"] = count;
        }
        return res.status(200).json({
          message: "Account Data",
          Data: allClientSideData,
          usrLen: count,
          stuLen: studentNumber.count,
        });
      }

      if (AccountType == 1) {
        for (let i = 0; i < allClientSideData.length; i++) {
          const parentFullName = await db.user.findOne({
            where: {
              UserID: allClientSideData[i].ParentID,
              IsActive: 1,
            },
            attributes: ["FirstName", "LastName"],
          });
          allClientSideData[i].dataValues["parentName"] =
            parentFullName.FirstName + " " + parentFullName.LastName;
        }
        return res.status(200).json({
          message: "Account Data",
          Data: allClientSideData,
          usrLen: count,
          stuLen: studentNumber.count,
        });
      }

      const ifStudentCount = await Promise.all(
        allClientSideData.map(async (singleParent) => {
          if (singleParent.AccountType == 3) {
            const allBelongingStudent = await db.user.findAndCountAll({
              where: {
                ParentID: singleParent.UserID,
                IsActive: { [Op.in]: [0, 1] },
              },
            });
            singleParent.dataValues.studentCount = allBelongingStudent.count;
          }
          return singleParent;
        })
      );
      // console.log(ifStudentCount);
      return res.status(200).json({
        message: "Account Data",
        Data: ifStudentCount,
        usrLen: count,
        stuLen: studentNumber.count,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

async function submitResetPasswordRequest(req, res) {
  try {
    const { userId, userUniqueId, userEmail, rn } = req.query;

    await db.resetPassword.destroy({
      where: {
        userId: userId,
        userUniqueId: userUniqueId,
        userEmail: userEmail,
      },
    });

    // const randomString = Math.random().toString(36).substring(2, 15);
    // const randomNumbers = cryptoJS
    //   .SHA256(randomString)
    //   .toString(cryptoJS.enc.Hex);

    await db.resetPassword.create({
      userId: userId,
      userUniqueId: userUniqueId,
      userEmail: userEmail,
      randomValidator: rn,
      createdBy: "Admin",
    });

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function resetPasswordUsers(req, res) {
  try {
    const { userEmail } = req.query;
    if (!userEmail) {
      return res.status(404).json({
        message: "User email not found",
      });
    }

    const userEmailExist = await db.useremail.findOne({
      where: {
        Email: userEmail,
        IsActive: "1",
      },
    });
    const usersData = await db.user.findByPk(userEmailExist?.UserID);

    if (!userEmailExist || !usersData) {
      return res.status(400).json({
        message: "Email is temporary not available! Please contact admin.",
      });
    }

    const randomString = Math.random().toString(36).substring(2, 15);
    const randomNumbers = cryptoJS
      .SHA256(randomString)
      .toString(cryptoJS.enc.Hex);

    await db.resetPassword.destroy({
      where: {
        userId: userEmailExist.UserID,
        userUniqueId: usersData.uniqueID,
        userEmail: userEmail,
      },
    });

    await db.resetPassword.create({
      userId: userEmailExist.UserID,
      userUniqueId: usersData.uniqueID,
      userEmail: userEmail,
      randomValidator: randomNumbers,
      createdBy: "Admin",
    });

    const redirectUrl = `https://dev.edbition.com/reset-password?uuid=${usersData.uniqueID}&uid=${userEmailExist.UserID}&rn=${randomNumbers}`;
    const userEmailReq = userEmail;

    const paramsKey = {
      Title: "Reset Your Password",
      Email_body:
        "We received a request to reset the password for your account. Click the button below to reset your password:",
      Email_about:
        "If you didn’t request a password reset, please ignore this email.",
      Reset_link: redirectUrl,
    };

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    let sendSmtpEmail = {
      to: [
        {
          email: userEmailReq,
          name: "userName",
        },
      ],
      templateId: 21,
      params: paramsKey,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return res.status(200).json({});
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function findUserByUniqueId(req, res) {
  try {
    const { uuid } = req.query;

    const dbDataForUUId = await db.user.findOne({
      where: { uniqueID: uuid },
    });

    return res.status(200).json({
      userData: dbDataForUUId,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function recoverUserAccount(req, res) {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(404).json({
        message: "Email not found"
      })
    }

    const userEmailExist = await db.useremail.findOne({
      where: { Email: userEmail }
    });
    if (!userEmailExist) {
      return res.status(404).json({
        message: "Email not found"
      })
    }

    await db.user.update(
      { IsActive: 1 },
      { where: { UserID: userEmailExist?.UserID } }
    );

    await db.useremail.update(
      { IsActive: '1' },
      { where: { UserID: userEmailExist?.UserID } }
    );

    return res.status(200).json({
      message: 'Account Recovered Successfully!'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Sorry! There was an server-side error'
    });
  }
}



module.exports = {
  get_profile,
  update_profile,
  get_profile_http,
  get_profiles_http,
  validate_email_http,
  get_http_users,
  submitResetPasswordRequest,
  resetPasswordUsers,
  findUserByUniqueId,
  recoverUserAccount
};

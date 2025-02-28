const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
const db = require("../models/index");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const notificationBody = require("../notifcationStructure/notificationStruct");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { cleanUpUser } = require("../helper/cleanUps");

// HTTP REQUEST

const add_parent_http = async (req, res, next) => {
  try {
    const result = req.body.parent;
    let originalEmail;

    try {
      const bytesEmail = cryptoJS.AES.decrypt(result.Email, process.env.SECRET);
      originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid encrypted email provided",
      });
    }

    if (!originalEmail) {
      return res.status(400).json({
        message: "Email decryption failed or resulted in an empty string",
      });
    }

    const emailExist = await db.useremail.findOne({
      where: { Email: originalEmail },
    });

    if (emailExist && !result.newCreateReq) {
      return res.status(203).json({
        message: "Email already exists",
      });
    }

    if (emailExist && result.newCreateReq) {
      const { success } = await cleanUpUser(emailExist.UserID, req, res);
      if (!success) {
        return res.status(500).json({
          message: "There was an error while creating new profile!"
        })
      }
    }

    const splittedEmail = originalEmail.split("@");
    let domainName;
    if (splittedEmail && splittedEmail.length > 0) {
      domainName = splittedEmail[splittedEmail.length - 1];
    }

    const companyDomainExist = await db.user.findOne({
      where: { CompanyDomain: domainName },
    });

    const newUser = await db.user.create({
      FirstName: result.FirstName,
      LastName: result.LastName,
      Email: result.Email,
      Password: result.Password,
      PhoneNumber: result.PhoneNumber,
      IsNoSuPeAchPoQu: parseInt(result.IsNoSuPeAchPoQu),
      IsNCourseExNewsProm: parseInt(result.IsNCourseExNewsProm),
      IsLookFeedback: parseInt(result.IsLookFeedback),
      IsActive: parseInt(result.IsActive),
      CreatedBy: "Admin",
      LastModifiedBy: "Admin",
      AccountType: 3,
      CompanyID: companyDomainExist ? companyDomainExist.UserID : 0,
    });

    await db.useremail.create({
      UserID: newUser.UserID,
      Email: originalEmail,
    });

    await db.FreeTrail.create({
      UserID: newUser.UserID,
      LastModifiedBy: "Admin",
    });

    // Notification Body >>
    notificationBody.userId = newUser.UserID;
    notificationBody.notificationTitle = `Welcome ${result.FirstName}, You are onboard!`;
    notificationBody.userEmailReq = originalEmail;
    notificationBody.emailType = "parent-created";
    notificationBody.userName = result.FirstName;

    req.visualNotificationBody = notificationBody;
    // Notification Body <<

    next(); // Add Notifications to table

    notificationBody.emailType = "beta-trial";
    sendTrailMail(notificationBody);

    return res.status(200).json({
      message: "Parent added successfully",
      data: newUser,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
      error: error,
    });
  }
};

const get_parent_by_id_http = async (req, res) => {
  try {
    console.log(req.params.UserID);
    const whereCondition = {};
    whereCondition.UserID = req.params.UserID;
    whereCondition.IsActive = { [Op.in]: ["0", "1"] };
    whereCondition.AccountType = 3;

    const userExist = await db.user.findOne({ where: whereCondition });

    if (userExist) {
      return res.status(200).json({
        message: "Profile Data",
        data: userExist,
      });
    } else {
      return res.status(400).json({ Data: "Parents Data Not Gets!" });
    }
  } catch (error) {
    return res.status(400).send({ ErrorCode: "REQUEST", Error: error });
  }
};

const update_parent_http = async (req, res) => {
  try {
    const result = req.body.parent;

    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        AccountType: "3",
      },
    });

    if (!userExist) {
      return res.status(200).json({
        message: "parent Not Exist",
      });
    }
    try {
      var data = {
        FirstName: result.FirstName,
        LastName: result.LastName,
        Email: result.Email,
        TeamOrparentName: result.TeamOrparentName,
        TeamMember: parseInt(req.body.parent.TeamMember),
        Password: result.Password,
        PhoneNumber: result.PhoneNumber,
        IsNoSuPeAchPoQu: parseInt(req.body.parent.IsNoSuPeAchPoQu),
        IsNCourseExNewsProm: parseInt(req.body.parent.IsNCourseExNewsProm),
        IsLookFeedback: parseInt(req.body.parent.IsLookFeedback),
        IsActive: parseInt(req.body.parent.IsActive),
        CreatedBy: "Admin",
        LastModifiedBy: "Admin",
        AccountType: 3,
        ParentID: result.ParentID,
      };

      //---User history table-------------------------------------------//
      const UserIDWiseData = await db.user.findOne({
        where: { UserID: req.params.UserID },
      });

      if (!UserIDWiseData) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Parent Data not found",
        });
      }
      const CreateUserHistoryData = await db.UserHistory.create(
        UserIDWiseData.dataValues
      );
      if (!CreateUserHistoryData) {
        return res.status(400).send({
          ErrorCode: "REQUEST",
          message: "Parent Data Not insert in History Table",
        });
      }
      //-------------------------------------------------------------------//
      await db.user.update(data, { where: { UserID: req.params.UserID } });
      return res.status(200).json({
        message: "parent Updated successfully",
      });
    } catch (error) {
      return res.status(200).json({
        message: "Failed to update Parent",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! there was server-side error",
    });
  }
};

const delete_parent_http = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        AccountType: "3",
      },
    });
    if (!userExist) {
      return res.status(200).json({
        message: "parent not exits",
      });
    }

    //---User history table-------------------------------------------//
    const UserIDWiseData = await db.user.findOne({
      where: { UserID: req.params.UserID },
    });

    if (!UserIDWiseData) {
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "parent Data not found",
      });
    }
    const CreateUserHistoryData = await db.UserHistory.create(
      UserIDWiseData.dataValues
    );
    if (!CreateUserHistoryData) {
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "parent Data Not insert in History Table",
      });
    }
    //-------------------------------------------------------------------//
    try {
      await db.user.update(
        {
          IsActive: "2",
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
        message: "parent deleted successfully",
      });
    } catch (error) {
      return res.status(200).json({
        message: "Failed to delete parent",
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "Sorry! there was server-side error",
    });
  }
};

// function to send beta mail
async function sendTrailMail(notify) {
  try {
    let defaultClient = SibApiV3Sdk.ApiClient.instance;
    let apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey =
      "";

    const {
      userEmailReq,
      emailType,
      userName,
    } = notify;

    // console.log(emailType);

    const emailDatabase = await db.EmailModel.findOne({
      where: { emailType: emailType },
    });

    if (userName) {
      emailDatabase.dataValues["name"] = userName;
    }

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    let sendSmtpEmail = {
      to: [
        {
          email: userEmailReq,
          name: "userName",
        },
      ],
      templateId: emailDatabase.sendInBlueId,
      params: emailDatabase,
      headers: {
        "X-Mailin-custom":
          "custom_header_1:custom_value_1|custom_header_2:custom_value_2",
      },
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  add_parent_http,
  update_parent_http,
  delete_parent_http,
  get_parent_by_id_http,
};

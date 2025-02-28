const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
const db = require("../models/index");
const Sequelize = require("sequelize");
const { signUpSchema } = require("../helper/validation");
const { Op } = require("sequelize");
const notificationBody = require("../notifcationStructure/notificationStruct");
const domainNames = require("../Data/domain");
const { cleanUpUser } = require("../helper/cleanUps");
require("dotenv").config();

// HTTP REQUEST

const add_company_http = async (req, res, next) => {
  try {
    const result = req.body.company;
    // const { userId } = req.query;

    // Decrypt the email
    let originalEmail;
    try {
      const bytesEmail = cryptoJS.AES.decrypt(result.Email, process.env.SECRET);
      originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid encrypted email provided",
      });
    }

    // Check if decryption returned a valid string
    if (!originalEmail) {
      return res.status(400).json({
        message: "Email decryption failed or resulted in an empty string",
      });
    }

    // Check if the email already exists
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

    if (domainNames.includes(domainName)) {
      return res.status(401).json({
        message: "Email should not be generic",
      });
    }

    // Create a new user
    const newUser = await db.user.create({
      FirstName: result.FirstName,
      LastName: result.LastName,
      Email: result.Email,
      TeamOrCompanyName: result.TeamOrCompanyName,
      TeamMember: parseInt(result.TeamMember),
      TotalInvites: parseInt(result.TeamMember),
      Password: result.Password,
      PhoneNumber: result.PhoneNumber,
      IsNCourseExNewsProm: parseInt(result.IsNCourseExNewsProm),
      IsLookFeedback: parseInt(result.IsLookFeedback),
      IsActive: parseInt(result.IsActive),
      CreatedBy: "Admin",
      LastModifiedBy: "Admin",
      AccountType: 2,
      CompanyDomain: domainName ? domainName : null,
    });

    // Add the email to the useremail table
    await db.useremail.create({
      UserID: newUser.UserID,
      Email: originalEmail,
    });

    // Notification Body >>
    notificationBody.userId = newUser.UserID;
    notificationBody.notificationTitle = `Welcome ${result.FirstName}, You are onboard!`;
    notificationBody.userEmailReq = originalEmail;

    req.visualNotificationBody = notificationBody;
    // Notification Body <<

    next(); // Add Notifications to table

    return res.status(200).json({
      message: "Company added successfully",
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

const get_company_by_id_http = async (req, res) => {
  try {
    const { limit } = req.query;
    const { offset } = req.query;

    const whereCondition = {};
    const parentWhereCondition = {};

    whereCondition.UserID = req.query.UserID;
    whereCondition.IsActive = { [Op.in]: ["0", "1"] };
    whereCondition.AccountType = "2";

    parentWhereCondition.AccountType = "3";
    parentWhereCondition.CompanyID = parseInt(req.query.UserID);
    parentWhereCondition.IsActive = { [Op.in]: ["0", "1"] };

    const userExist = await db.user.findOne({ where: whereCondition });

    if (userExist) {
      const parentData = await db.user.findAll({
        where: parentWhereCondition,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      if (parentData && parentData.length > 0) {
        for (let i = 0; i < parentData.length; i++) {
          const { count } = await db.user.findAndCountAll({
            where: { ParentID: parentData[i].UserID, AccountType: "1" },
          });
          parentData[i].dataValues["studentCount"] = count;
        }
      }
      // const parentData = [];

      return res.status(200).json({
        message: "Profile Data",
        data: userExist,
        empData: parentData,
      });
    } else {
      return res.status(400).json({ Data: "Profile Data Not Gets!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send({ ErrorCode: "REQUEST", Error: error });
  }
};

const update_company = async (req, res) => {
  try {
    const result = req.body.company;

    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        AccountType: "2",
      },
    });

    if (!userExist) {
      return res.status(400).json({
        message: "Company Not Exist",
      });
    }

    const bytesEmail = cryptoJS.AES.decrypt(result.Email, process.env.SECRET);
    const originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);

    // Check if decryption returned a valid string
    if (!originalEmail) {
      return res.status(400).json({
        message: "Email decryption failed or resulted in an empty string",
      });
    }

    const splittedEmail = originalEmail.split("@");
    let domainName;
    if (splittedEmail && splittedEmail.length > 0) {
      domainName = splittedEmail[splittedEmail.length - 1];
    }

    if (domainNames.includes(domainName)) {
      return res.status(401).json({
        message: "Email should not be generic",
      });
    }

    // console.log(userExist);
    var data = {
      FirstName: result.FirstName,
      LastName: result.LastName,
      Email: result.Email,
      TeamOrCompanyName: result.TeamOrCompanyName,
      TeamMember: parseInt(req.body.company.TeamMember),
      Password: result.Password,
      PhoneNumber: result.PhoneNumber,
      IsNCourseExNewsProm: parseInt(req.body.company.IsNCourseExNewsProm),
      IsLookFeedback: parseInt(req.body.company.IsLookFeedback),
      IsActive: parseInt(req.body.company.IsActive),
      CreatedBy: "Admin",
      LastModifiedBy: "Admin",
      AccountType: 2,
      ParentID: result.ParentID,
    };
    // Formulae Used (z - x) + y ; z = new team count, x = old team count, y = old invites count
    const newMemberCount = result.TeamMember;
    const oldMemberCount = userExist.TeamMember;
    const invitesLeft = userExist.TotalInvites;

    const calculatedInvites = newMemberCount - oldMemberCount + invitesLeft;
    data.TotalInvites = calculatedInvites;

    //---User history table-------------------------------------------//
    const UserIDWiseData = await db.user.findOne({
      where: { UserID: req.params.UserID },
    });

    if (!UserIDWiseData) {
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "Company Data not found",
      });
    }
    const CreateUserHistoryData = await db.UserHistory.create(
      UserIDWiseData.dataValues
    );
    if (!CreateUserHistoryData) {
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "Company Data Not insert in History Table",
      });
    }
    //-------------------------------------------------------------------//
    await db.user.update(data, { where: { UserID: req.params.UserID } });
    return res.status(200).json({
      message: "Company Updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! there was server-side error",
    });
  }
};

const delete_company = async (req, res) => {
  try {
    const userExist = await db.user.findOne({
      where: {
        UserID: req.params.UserID,
        AccountType: "2",
      },
    });
    if (!userExist) {
      return res.status(200).json({
        message: "Company not exits",
      });
    }

    //---User history table-------------------------------------------//
    const UserIDWiseData = await db.user.findOne({
      where: { UserID: req.params.UserID },
    });

    if (!UserIDWiseData) {
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "Company Data not found",
      });
    }
    const CreateUserHistoryData = await db.UserHistory.create(
      UserIDWiseData.dataValues
    );
    if (!CreateUserHistoryData) {
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "Company Data Not insert in History Table",
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
        message: "Company deleted successfully",
      });
    } catch (error) {
      return res.status(200).json({
        message: "Failed to delete Company",
      });
    }
  } catch (error) {
    return res.status(200).json({
      message: "Sorry! there was server-side error",
    });
  }
};

// async function getEmployeeCount(req, res) {
//     try {
//         const { AccDetails } = req;
//         if (!AccDetails || !AccDetails.UserID) {
//             return res.status(401).json({
//                 message: "Invalid Token Login Again"
//             })
//         }

//         const { count } = await db.user.findAndCountAll({
//             where: {
//                 CompanyID: { [Op.ne]: 0 },
//                 IsActive: 1
//             }
//         });
//         return res.status(200).json({
//             empCount: count
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             message: "Sorry! There was a server-side error",
//         });
//     }
// }

async function getAcceptedMemberList(req, res) {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({
        message: "Invalid company",
      });
    }

    const companyData = await db.user.findOne({
      where: { UserID: companyId, AccountType: 2 },
    });

    if (!companyData) {
      return res.status(400).json({
        message: "Invalid company",
      });
    }

    const whereCondition = {};

    whereCondition.CompanyID = companyId;
    whereCondition.IsActive = 1;

    const activeMembers = await db.user.findAndCountAll({
      where: whereCondition,
    });

    return res.status(200).json({
      activeCount: activeMembers.count,
      totalCount: companyData.TeamMember
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

module.exports = {
  add_company_http,
  update_company,
  delete_company,
  get_company_by_id_http,
  getAcceptedMemberList
};

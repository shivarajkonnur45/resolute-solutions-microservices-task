const {
  admin,
  staffAdmin,
  userEmail,
  user,
  adminhistory,
  sequelize,
} = require("../models/index");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
const notificationBody = require("../notifcationStructure/notificationStruct");
require("dotenv").config();

async function AddStaff(req, res, next) {
  try {
    const {
      FirstName,
      LastName,
      TeamOrCompanyName,
      TeamMember,
      Email,
      Password,
      PhoneNumber,
      AccountID,
      IsParticipateCompetitions,
      IsNoSuPeAchPoQu,
      IsNCourseExNewsProm,
      IsLookFeedback,
      AccountType,
      StaffPermission,
      ParentID,
      IsActive,
      Status,
      CreatedBy,
    } = req.body;

    const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
    const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);

    const alreadyExistEmail = await staffAdmin.findOne({
      where: {
        staffEmail: originalEmail,
      },
    });
    if (alreadyExistEmail) {
      return res.status(203).json({
        message: "Email Already Exist",
      });
    } else {
      try {
        const newUser = await admin.create({
          FirstName,
          LastName,
          TeamOrCompanyName,
          TeamMember,
          Email: Email,
          Password: Password,
          PhoneNumber,
          AccountID,
          IsParticipateCompetitions,
          IsNoSuPeAchPoQu,
          IsNCourseExNewsProm,
          IsLookFeedback,
          AccountType,
          StaffPermission,
          ParentID,
          IsActive,
          Status,
          CreatedBy,
        });
        await staffAdmin.create({ staffEmail: originalEmail });
        // await t.commit();
        // Notification Body >>
        notificationBody.userId = newUser.UserID;
        notificationBody.notificationTitle = "Staff Added Successfully";

        req.visualNotificationBody = notificationBody;
        // Notification Body <<

        next(); // Add Visual Notifications to table

        return res.status(200).json({
          message: "Done",
        });
      } catch (error) {
        // await t.rollback();
        console.log(error);
        return res.status(501).json({
          message: "Error while securing Credentials",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! Server side error",
    });
  }
}

async function createUser(req, res) {
  // const t = await sequelize.transaction();
  try {
    const {
      FirstName,
      LastName,
      TeamOrCompanyName,
      TeamMember,
      Email,
      Password,
      AccountID,
      IsParticipateCompetitions,
      IsNoSuPeAchPoQu,
      IsNCourseExNewsProm,
      IsLookFeedback,
      AccountType,
      IsActive,
      CreatedBy,
    } = req.body;
    const encryptEmail = await cryptoJS.AES.encrypt(
      Email,
      process.env.SECRET
    ).toString();
    const encryptPassword = await cryptoJS.AES.encrypt(
      Password,
      process.env.SECRET
    ).toString();
    await user.create({
      FirstName,
      LastName,
      TeamOrCompanyName,
      TeamMember,
      Email: encryptEmail,
      Password: encryptPassword,
      AccountID,
      IsParticipateCompetitions,
      IsNoSuPeAchPoQu,
      IsNCourseExNewsProm,
      IsLookFeedback,
      AccountType: AccountType,
      IsActive,
      CreatedBy,
    });
    await userEmail.create({ emailUser: Email });
    // await t.commit();
    res.status(200).json({
      message: "User Created Successfully",
    });
  } catch (error) {
    // await t.rollback();
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}
async function ViewStaffByID(req, res) {
  try {
    const id = req.params.id;

    const whereCondition = {};
    whereCondition.UserID = id;
    whereCondition.IsActive = { [Op.in]: ["0", "1"] };

    const GetStaffData = await admin.findOne({
      where: whereCondition,
    });
    if (GetStaffData) {
      return res.status(200).json({
        TotalCount: GetStaffData.length,
        Data: GetStaffData,
      });
    } else {
      return res.status(400).json({ Data: "Staff Data Not Gets!" });
    }
  } catch (error) {
    return res
      .status(400)
      .send({
        ErrorCode: "REQUEST",
        message: error.message,
        Error: error,
      });
  }
}

async function ViewStaff(req, res) {
  try {
    let { page, pageSize, Search } = req.query;
    page = page ? parseInt(page, 10) : 1;

    pageSize = pageSize ? parseInt(pageSize, 10) : 10;

    pageSize = pageSize <= 100 ? pageSize : 10;

    const whereCondition = {};
    if (Search) {
      whereCondition[Op.or] = [{ AccountType: { [Op.like]: `%${Search}%` } }];
    }

    whereCondition.IsActive = { [Op.in]: ["0", "1"] };

    const { count, rows } = await admin.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      where: whereCondition,
      order: [["UserID", "ASC"]],
    });

    if (rows !== null) {
      return res.status(200).json({
        TotalCount: count,
        page: page,
        pageSize: pageSize,
        Data: rows,
      });
    } else {
      return res.status(400).json({ Data: "Admin Data Not Gets!" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({
        ErrorCode: "REQUEST",
        message: error.message,
        Error: error,
      });
  }
}

async function UpdateStaff(req, res) {
  // const t = await sequelize.transaction();
  try {
    const {
      FirstName,
      LastName,
      TeamOrCompanyName,
      TeamMember,
      Email,
      Password,
      AccountID,
      IsParticipateCompetitions,
      IsNoSuPeAchPoQu,
      IsNCourseExNewsProm,
      IsLookFeedback,
      AccountType,
      IsActive,
      CreatedBy,
    } = req.body;

    const id = req.params.id;
    const result = req.body;
    const GetStaffData = await admin.findOne({ where: { UserID: id } });
    if (!GetStaffData) {
      return res
        .status(400)
        .send({ ErrorCode: "REQUEST", message: "Staff Data not found" });
    }
    const CreateStaffHistoryData = await adminhistory.create(
      GetStaffData.dataValues
    );
    if (!CreateStaffHistoryData) {
      // await t.rollback();
      return res
        .status(400)
        .send({
          ErrorCode: "REQUEST",
          message: "Staff Data Not insert in History Table",
        });
    }
    // const encryptEmail = await cryptoJS.AES.encrypt(Email, process.env.SECRET).toString();
    // const encryptPassword = await cryptoJS.AES.encrypt(Password, process.env.SECRET).toString();

    const UpdateStaffData = await admin.update(
      {
        FirstName,
        LastName,
        TeamOrCompanyName,
        TeamMember,
        Email: Email,
        Password: Password,
        AccountID,
        IsParticipateCompetitions,
        IsNoSuPeAchPoQu,
        IsNCourseExNewsProm,
        IsLookFeedback,
        AccountType,
        IsActive,
        CreatedBy,
      },
      { where: { UserID: id } }
    );

    // console.log(UpdateStaffData);
    if (!UpdateStaffData) {
      // await t.rollback();
      return res.status(200).json({
        Message: "Staff information Not Update!",
      });
    }
    // await t.commit();
    return res.status(200).json({
      Message: "Staff information Update successfully!",
    });
  } catch (error) {
    // await t.rollback();
    console.log(error);
    return res
      .status(400)
      .send({
        ErrorCode: "REQUEST",
        message: error.message,
        Error: error,
      });
  }
}

async function deleteStaff(req, res) {
  // const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const GetStaffData = await admin.findOne({ where: { UserID: id } });
    if (!GetStaffData) {
      return res
        .status(400)
        .send({ ErrorCode: "REQUEST", message: "Staff Data not found" });
    }
    const CreateAdminHistoryData = await adminhistory.create(
      GetStaffData.dataValues
    );
    if (!CreateAdminHistoryData) {
      // await t.rollback();
      return res
        .status(400)
        .send({
          ErrorCode: "REQUEST",
          message: "Staff Data Not insert in History Table",
        });
    }
  
    const DeleteStaffData = await admin.update(
      {
        IsActive: "2",
      },
      { where: { UserID: id } }
    );

    const DeleteStaffDataEmail = await staffAdmin.update(
      {
        IsActive: "2",
      },
      { where: { StaffID: id } }
    );

    if (!DeleteStaffData || !DeleteStaffDataEmail) {
      // await t.rollback();
      return res
        .status(400)
        .send({ ErrorCode: "REQUEST", message: "Staff Data Not deleted" });
    }
    // await t.commit();
    return res.status(201).json({ message: "Data Deleted successfully" });
  } catch (error) {
    // await t.rollback();
    return res.status(500).json({message:"Sorry server side error", error: error });
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

    const userEmailExist = await staffAdmin.findOne({
      where: { staffEmail: userEmail }
    });
    if (!userEmailExist) {
      return res.status(404).json({
        message: "Email not found"
      })
    }

    await admin.update(
      {IsActive: '1'},
      {where:{UserID: userEmailExist?.StaffID}}
    );

    await staffAdmin.update(
      {IsActive: '1'},
      {where:{StaffID: userEmailExist?.StaffID}}
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
  ViewStaffByID,
  AddStaff,
  createUser,
  ViewStaff,
  UpdateStaff,
  deleteStaff,
  recoverUserAccount
};

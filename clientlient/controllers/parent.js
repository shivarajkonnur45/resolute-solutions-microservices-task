const db = require("../models/index");
const cryptoJS = require("crypto-js");
const notificationBody = require("../notifcationStructure/notificationStruct");

async function addParentFromCompany(req, res, next) {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }

    const {
      FirstName,
      LastName,
      Email,
      Password,
      PhoneNumber,
      IsNoSuPeAchPoQu,
      IsNCourseExNewsProm,
      IsLookFeedback,
      IsActive,
    } = req.body;

    const bytesEmail = cryptoJS.AES.decrypt(Email, process.env.SECRET);
    const originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);

    if (!originalEmail) {
      return res.status(400).json({
        message: "Email decryption failed or resulted in an empty string",
      });
    }

    const emailExist = await db.useremail.findOne({
      where: { Email: originalEmail },
    });

    if (emailExist) {
      return res.status(401).json({
        message: "Email already exists",
      });
    }

    const newUser = await db.user.create({
      FirstName: FirstName,
      LastName: LastName,
      Email: Email,
      Password: Password,
      PhoneNumber: PhoneNumber,
      IsNoSuPeAchPoQu: parseInt(IsNoSuPeAchPoQu),
      IsNCourseExNewsProm: parseInt(IsNCourseExNewsProm),
      IsLookFeedback: parseInt(IsLookFeedback),
      IsActive: parseInt(IsActive),
      CreatedBy: "Company",
      LastModifiedBy: "Company",
      AccountType: 3,
      ManuallyAdded: 1,
    });

    await db.useremail.create({
      UserID: newUser.UserID,
      Email: originalEmail,
    });

    const isSub = await db.Subscription.findOne({
      where: { CompanyID: AccDetails.UserID, SubscriptionStatus: 1 },
    });

    if (isSub) {
      await db.freezeSub.create({
        userId: newUser.UserID,
        createdBy: AccDetails?.FirstName,
      });
    }

    // Notification Body >>
    notificationBody.userId = newUser.UserID;
    notificationBody.notificationTitle = `Welcome ${FirstName}, You are onboard!`;
    notificationBody.userEmailReq = originalEmail;

    req.visualNotificationBody = notificationBody;
    // Notification Body <<

    next(); // Add Notifications to table

    return res.status(200).json({
      message: "Parent added successfully",
      data: newUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "There was an error while adding company",
    });
  }
}

async function getParentById(req, res) {
  try {
    const { parentId } = req.query;

    if (!parentId) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const parentData = await db.user.findByPk(parentId);

    if (!parentData) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    return res.status(200).json({
      Data: parentData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function updateParentDataFromCompany(req, res) {
  try {
    const { parentId } = req.query;

    if (!parentId) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const parentData = await db.user.findByPk(parentId);

    if (!parentData) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const {
      FirstName,
      LastName,
      Email,
      Password,
      PhoneNumber,
      IsNoSuPeAchPoQu,
      IsNCourseExNewsProm,
      IsLookFeedback,
      IsActive,
    } = req.body;

    await db.user.update(
      {
        FirstName: FirstName,
        LastName: LastName,
        Email: Email,
        Password: Password ? Password : parentData.Password,
        PhoneNumber: PhoneNumber,
        IsNoSuPeAchPoQu: parseInt(IsNoSuPeAchPoQu),
        IsNCourseExNewsProm: parseInt(IsNCourseExNewsProm),
        IsLookFeedback: parseInt(IsLookFeedback),
        IsActive: parseInt(IsActive),
        CreatedBy: "Company",
        LastModifiedBy: "Company",
        AccountType: 3,
        LastModifiedOn: Date.now(),
      },
      { where: { UserID: parentId } }
    );

    return res.status(200).json({
      message: "Company updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function deleteParentFromCompany(req, res) {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid Token! Login Again",
      });
    }

    const { parentId } = req.query;

    if (!parentId) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    await db.user.update({ IsActive: 2 }, { where: { UserID: parentId } });
    await db.useremail.update(
      {
        IsActive: "2",
      },
      { where: { UserID: parentId } }
    );
    await db.Subscription.update(
      { SubscriptionCount: db.sequelize.literal("SubscriptionCount - 1") },
      { where: { CompanyID: AccDetails.UserID, SubscriptionStatus: 1 } }
    );

    return res.status(200).json({
      message: "Company deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

// async function inviteAFriend(req, res) {
//   try {
//     const { AccDetails } = req;

//     if (!AccDetails || !AccDetails.UserID || !AccDetails.Email) {
//       return res.status(400).json({
//         message: "Invalid token! Login again",
//       });
//     }


//     return res.status(200).json({});
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "Sorry! There was a server-side error",
//     });
//   }
// }

module.exports = {
  addParentFromCompany,
  getParentById,
  updateParentDataFromCompany,
  deleteParentFromCompany,
};

const { admin, staffAdmin, resetPassword } = require("../models/index");
const jwt = require("jsonwebtoken");
const cryptoJS = require("crypto-js");
const fs = require("fs");
const axios = require("axios");
const SibApiV3Sdk = require("sib-api-v3-sdk");
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "";
require("dotenv").config();

const parentLogin = async (req, res) => {
  try {
    const Password = req.body.Password;
    const { PK } = req;
    console.log(PK);
    if (!PK) {
      res.status(501).json({
        message: "Sorry! There was an error while fetching your email",
      });
    } else {
      const userPassExist = await admin.findByPk(PK);
      // console.log(userPassExist);
      if (!userPassExist) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        const bytesPassword = await cryptoJS.AES.decrypt(
          Password,
          process.env.SECRET
        );
        const frontPassword = await bytesPassword.toString(cryptoJS.enc.Utf8);
        const backPass = await cryptoJS.AES.decrypt(
          userPassExist.Password,
          process.env.SECRET
        );
        const usePass = await backPass.toString(cryptoJS.enc.Utf8);
        if (usePass === frontPassword) {
          try {
            const token = await jwt.sign(
              { accountDetail: userPassExist },
              process.env.SECRET
            );
            res.status(200).json({
              message: "Logged In",
              userToken: token,
            });
          } catch (error) {
            res.status(501).json({
              message: "Error while creating token",
            });
          }
        } else {
          res.status(401).json({
            message: "Invalid Password",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! there was server-side error",
    });
  }
};

async function passwordResetReqAdmin(req, res, next) {
  try {
    const { userUniqueId, userId } = req.query;
    if (!userUniqueId || !userId) {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }

    const randomString = Math.random().toString(36).substring(2, 15);
    const randomNumbers = cryptoJS
      .SHA256(randomString)
      .toString(cryptoJS.enc.Hex);
    req.randomNumbers = randomNumbers;

    // const adminExist = await admin.findOne({
    //   where: { UserID: userId, uniqueID: userUniqueId },
    // });
    const adminExist = await staffAdmin.findOne({
      where: { StaffID: userId },
    });

    if (adminExist) {
      req.userEmailReq = adminExist.staffEmail;
      req.reqFrom = "Admin";
    } else {
      const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;

      const respStudentData = await axios.get(
        `${clientUrl}/student/resetPasswordStudent/forAdmin?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (
        !respStudentData.data ||
        respStudentData.data.statusEmail == 0 ||
        !respStudentData.data.Data.Email
      ) {
        return res.status(404).json({
          message: "Email not found",
        });
      }

      const respResetData = await axios.get(
        `${clientUrl}/profile/users/setResetPassword?userId=${userId}&userUniqueId=${userUniqueId}&userEmail=${respStudentData.data.Data.Email}&rn=${randomNumbers}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!respResetData.data) {
        return res.status(400).json({
          message: "Error while creating your reset password",
        });
      }

      req.userEmailReq = respStudentData.data.Data.Email;
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function resetPasswordAdmin(req, res) {
  try {
    const { userEmail } = req.query;
    if (!userEmail) {
      return res.status(404).json({
        message: "User email not found",
      });
    }

    const userEmailExist = await staffAdmin.findOne({
      where: {
        staffEmail: userEmail,
      },
    });
    const usersData = await admin.findByPk(userEmailExist?.StaffID);

    if (!userEmailExist || !usersData) {
      return res.status(400).json({
        message: "Email is temporary not available!",
      });
    }

    const randomString = Math.random().toString(36).substring(2, 15);
    const randomNumbers = cryptoJS
      .SHA256(randomString)
      .toString(cryptoJS.enc.Hex);

    await resetPassword.destroy({
      where: {
        userId: userEmailExist.StaffID,
        userUniqueId: usersData.uniqueID,
        userEmail: userEmail,
      },
    });

    await resetPassword.create({
      userId: userEmailExist.StaffID,
      userUniqueId: usersData.uniqueID,
      userEmail: userEmail,
      randomValidator: randomNumbers,
      createdBy: "Admin",
    });

    const redirectUrl = `https://dev.edbition.com/reset-password?uuid=${usersData.uniqueID}&uid=${userEmailExist.UserID}&rn=${randomNumbers}?from=Admin`;
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

async function changePasswordAdmin(req, res) {
  try {
    const { uId, uuId, rn } = req.query;
    const { password } = req.body;

    if (!uId || !uuId || !rn || !password) {
      return res.status(400).json({
        message: "User not found or Invalid Arguments",
      });
    }

    const isReadyForUpdate = await resetPassword.findOne({
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

    const userData = await db.user.findOne({
      where: whereCondition,
    });

    if (!userData) {
      return res.status(404).json({
        message: "User not found!"
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

    if (decryptPassDbMain == decryptPassUserMain) {
      return res.status(403).json({
        message: "The new password cannot be the same as the current password. Please choose a different password."
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
  parentLogin,
  passwordResetReqAdmin,
  resetPasswordAdmin,
  changePasswordAdmin
};

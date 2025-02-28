const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
const db = require("../models/index");
const { Op } = require("sequelize");
const checkUserSubscription = require("../cache/subWebhook");
const { sendFCMNotification } = require("../middleware/notification");
// const { signUpSchema } = require('../helper/validation');

const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
    const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);

    const emailExist = await db.useremail.findOne({
      where: {
        Email: originalEmail,
      },
    });

    if (!emailExist) {
      res.status(404).json({
        message: "Email Not Found",
      });
    } else {
      const PK = emailExist.UserID;
      if (!PK) {
        res.status(501).json({
          message: "Sorry! There was an error while fetching your email",
        });
      } else {
        const userPassExist = await db.user.findOne({
          where: { UserID: PK, isActive: { [Op.ne]: 2 } },
        });
        if (!userPassExist) {
          return res.status(404).json({
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
              if (userPassExist.AccountType == 1) {
                // if (1 != 1) {
                // console.log(`student is here -> ${userPassExist.UserID}`);
                checkUserSubscription(
                  userPassExist.UserID,
                  userPassExist.ParentID
                );
                const notify = await db.visualnotification.findOne({
                  where: { userId: userPassExist.UserID, isSeen: 0 }
                });
                // console.log(userPassExist.UserID);
                if (notify) {
                  await sendFCMNotification(notify);
                  await db.visualnotification.update(
                    { isSeen: 1 },
                    { where: { notificationId: notify.notificationId } }
                  );
                }
              } // Subscription check
              const token = await jwt.sign(
                { accountDetail: userPassExist },
                process.env.JWT_SECRET
              );

              const updatedUser = await db.user.update(
                { IsActive: 1 },
                {
                  where: {
                    UserID: emailExist.UserID,
                    IsActive: 0,
                  },
                }
              );

              return res.status(200).json({
                message: "Logged In",
                userToken: token,
                data: {
                  FirstName: userPassExist.FirstName,
                  LastName: userPassExist.LastName,
                  Grade: userPassExist.Grade,
                  AccountType: userPassExist.AccountType,
                },
              });
            } catch (error) {
              console.log(error);
              return res.status(501).json({
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
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! there was server-side error",
    });
  }
};

module.exports = {
  login,
};

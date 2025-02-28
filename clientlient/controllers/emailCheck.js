const db = require("../models/index");
const cryptoJS = require("crypto-js");
require("dotenv").config();

async function emailCheckUser(req, res) {
  try {
    let { Email, userID } = req.query;

    if (!Email) {
      return res.status(401).json({
        message: "Email Not Found",
        statusCode: 1,
      });
    } else {
      const formattedEmail = Email.replace(/ /g, "+");
      if (userID == 0) {
        const key = process.env.SECRET;
        let bytesEmail = cryptoJS.AES.decrypt(formattedEmail, key);
        const originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);
        if (originalEmail) {
          const alreadyExistEmail = await db.useremail.findOne({
            where: { Email: originalEmail, IsActive: "1" },
          });
          if (alreadyExistEmail) {
            return res.status(401).json({
              message: "Already Existing Email",
              statusCode: 1,
            });
          } else {
            return res.status(200).json({
              message: "You are good to go!",
              statusCode: 0,
            });
          }
        } else {
          return res.status(200).json({
            message: "You are good to go!",
            statusCode: 0,
          });
        }
      } else {
        const bytesEmail = await cryptoJS.AES.decrypt(
          formattedEmail,
          process.env.SECRET
        );
        const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
        // console.log(originalEmail);
        const userTypeId = parseInt(userID);
        // console.log(userTypeId);
        const userEditFound = await db.useremail.findOne({
          where: { UserID: userTypeId },
        });
        // console.log(userEditFound);
        const existCheck = await db.useremail.findOne({
          where: { Email: originalEmail },
        });
        if (!existCheck) {
          return res.status(200).json({
            message: "You are good to go!",
            statusCode: 0,
          });
        } else {
          if (userEditFound.UserID != existCheck.UserID) {
            return res.status(403).json({
              message: "Already Existing Email",
              statusCode: 1,
            });
          } else {
            return res.status(200).json({
              message: "You are good to go!",
              statusCode: 0,
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

module.exports = emailCheckUser;

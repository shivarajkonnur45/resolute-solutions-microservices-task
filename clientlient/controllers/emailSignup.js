const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const db = require("../models/index");
const { v4: uuidv4 } = require("uuid");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const path = require("path");
const fs = require("fs/promises");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const { Op } = require("sequelize");
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "";
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "zoho",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

//Base api to generate email for otp
async function emailGenerate(req, res) {
  try {
    const { userEmail } = req.query;
    const { fromSignIn } = req;
    if (!userEmail) {
      res.status(401).json({
        message: "Cannot Reset Password for Non exisiting user",
      });
    } else {
      const alreadyExist = await db.useremail.findOne({
        where: { Email: userEmail, IsActive: { [Op.ne]: "2" } },
      });

      if (alreadyExist && fromSignIn == undefined) {
        return res.status(400).json({
          message: "Email Already Exist! Try new one",
        });
      }
      const adminUrl = process.env.HTTP_REQUEST_ADMIN;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;

      const respCheckAdminSide = await axios.get(
        `${adminUrl}/emailCheckAdmin?userEmail=${userEmail}`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      const isValidOrNot = respCheckAdminSide.data
        ? respCheckAdminSide.data.foundCode
        : undefined;

      if (isValidOrNot == 1 || isValidOrNot == undefined) {
        return res.status(400).json({
          message: "Hey! This account is linked to Admin.",
        });
      }

      async function otpgen() {
        try {
          const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });
          return otp;
        } catch (error) {
          return res.status(501).json({
            message: "Error while generating OTP",
          });
        }
      }
      const otpGenerated = await otpgen();
      const alreadyOtp = await db.OTP.findOne({
        where: { Email: userEmail, isNotUsed: 1 },
      });

      if (alreadyOtp) {
        await db.OTP.update(
          { otpUser: otpGenerated, newGeneratedOn: Date.now() },
          { where: { Email: userEmail } }
        );
      }
      if (!alreadyOtp) {
        await db.OTP.create({ Email: userEmail, otpUser: otpGenerated });
      }

      // Working line

      const emailType = fromSignIn ? "signIn-otp" : "signUp-otp";

      // db stored email fields
      const emailDatabase = await db.EmailModel.findOne({
        where: { emailType: emailType },
      });

      emailDatabase.dataValues["otp"] = otpGenerated;

      if (!emailDatabase) {
        return res.status(500).json({
          message: "Unusual interruption occurred!",
          tip: "Check for email database , is it created?",
        });
      }

      try {
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        let sendSmtpEmail = {
          to: [
            {
              email: userEmail,
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

        return res.status(200).json({
          message: "OTP Sent Successfully",
        });
      } catch (error) {
        console.log(error);
        res.status(501).json({
          message: "Error while sending mail",
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

async function compareOtp(req, res) {
  try {
    const { userEmail, Otp } = req.query;
    const alreadyExistingMail = await db.useremail.findOne({
      where: { Email: userEmail },
    });
    if (alreadyExistingMail) {
      return res.status(400).json({
        message: "Email Already Exist! Login",
      });
    } else {
      if (!userEmail || !Otp) {
        return res.status(404).json({
          message: "Invalid Request",
        });
      } else {
        const dbOtp = await db.OTP.findOne({
          where: { Email: userEmail, otpUser: Otp, isNotUsed: 1 },
        });
        const firstName = await userEmail.split("@")[0];
        if (dbOtp) {
          const encryptedEmail = cryptoJS.AES.encrypt(
            userEmail,
            process.env.SECRET
          ).toString(); // Encrypting mail before storing it
          const selfGeneratedPassword = "EmailLogin-" + uuidv4();
          const userCreated = await db.user.create({
            // Adding user data from google login to user db
            FirstName: firstName,
            Email: encryptedEmail,
            Password: selfGeneratedPassword,
            AccountType: 3,
          });
          await db.useremail.create({
            UserID: userCreated.UserID,
            Email: userEmail,
          }); // Add Email from google login to useremail db
          await db.OTP.update(
            { isNotUsed: 0 },
            { where: { OtpID: dbOtp.OtpID } }
          ); // Setting OTP To inactive
          const tokenJwt = await jwt.sign(
            {
              accountDetail: {
                UserID: userCreated.UserID,
                uniqueID: userCreated.uniqueID,
                FirstName: firstName,
                LastName: firstName,
                Email: encryptedEmail,
                AccountType: 3,
              },
            },
            process.env.JWT_SECRET
          );
          return res.status(200).json({
            message: "Logged in Successfully",
            FirstName: firstName,
            LastName: firstName,
            AccountType: 3,
            token: tokenJwt,
          });
        } else {
          return res.status(400).json({
            message: "Invalid OTP",
          });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an error while matching OTP",
    });
  }
}

module.exports = { emailGenerate, compareOtp };

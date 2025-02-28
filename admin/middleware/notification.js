const db = require("../models/index");
// const nodemailer = require("nodemailer");
const AWS = require("aws-sdk");

AWS.config.update({ region: process.env.SQS_REGION });
var sqs = new AWS.SQS({ apiVersion: process.env.SQS_API_VERSION });
const cryptoJS = require("crypto-js");
const SibApiV3Sdk = require("sib-api-v3-sdk");
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey =
  "";
require("dotenv").config();

// const transporter = nodemailer.createTransport({
//     service: 'zoho',
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASS,
//     },
// });

// async function sendEmailAsNotification(req, res) {
//     try {
//         const mailoption = {
//             from: process.env.EMAIL,
//             to: userEmail,
//             subject: `Email Notification`,
//             text: `Mail Check`
//         }

//         const info = await transporter.sendMail(mailoption);
//         res.status(200).json({
//             message: "Email Sent"
//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             message: "There was an error while sending Notification"
//         })
//     }
// }

async function addVisualAsNotification(req, res) {
  try {
    const { userId, notificationTitle, notificationBody } =
      req.visualNotificationBody;

    await db.visualnotification.create({
      userId: userId,
      notificationTitle: notificationTitle,
      notificationBody: notificationBody,
    });
  } catch (error) {
    console.log(error);
  }
}

async function sendNotificationViaSqs(data) {
  try {
    const message = {
      courseId: data.courseId,
      notification: data.notify,
    };

    const params = {
      DelaySeconds: 0,
      MessageBody: JSON.stringify(message),
      MessageDeduplicationId: "TheWhistler",
      MessageGroupId: "Group1",
      QueueUrl: process.env.SQS_ACTIVITY_URL,
    };

    sqs.sendMessage(params);
    console.log("Sqs Message sent");
    // Notification sent via sqs >>
  } catch (error) {
    console.log(error);
  }
}

async function sendResetPassword(req, res) {
  try {
    const { userUniqueId, userId } = req.query;
    const { randomNumbers, reqFrom, userEmailReq } = req;

    await db.resetPassword.destroy({
      where: {
        userId: userId,
        userUniqueId: userUniqueId,
        userEmail: userEmailReq,
      },
    });

    await db.resetPassword.create({
      userId: userId,
      userUniqueId: userUniqueId,
      userEmail: userEmailReq,
      randomValidator: randomNumbers,
      createdBy: "Admin",
    });

    const redirectUrl = `https://dev.edbition.com/reset-password?uuid=${userUniqueId}&uid=${userId}&rn=${randomNumbers}&from=${reqFrom ? reqFrom : "Client"
      }`;


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

    return res.status(200).json({
      message: "Reset email sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

module.exports = {
  addVisualAsNotification,
  sendNotificationViaSqs,
  sendResetPassword,
};

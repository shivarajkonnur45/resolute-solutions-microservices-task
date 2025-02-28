const db = require("../models/index");
// const AWS = require('aws-sdk');
// const nodemailer = require("nodemailer");
// const fs = require("fs/promises");
// const path = require("path");
// const admin = require("firebase-admin");
// const serviceAccount = require("../Data/edbition-lms-b0f71-firebase-adminsdk-hzabu-5d5f277d81.json");
// const SibApiV3Sdk = require("sib-api-v3-sdk");

// Configure API key authorization
// let defaultClient = SibApiV3Sdk.ApiClient.instance;
// let apiKey = defaultClient.authentications["api-key"];
// apiKey.apiKey =
//   "";
// AWS.config.update({ region: process.env.SQS_REGION });
// var sqs = new AWS.SQS({ apiVersion: process.env.SQS_API_VERSION });
require("dotenv").config();

// Configuration for email
// const transporter = nodemailer.createTransport({
//     service: "zoho",
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASS,
//     },
// });

//Configuration for push notification
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// Function to send email notification
async function sendEmailAsNotification(req, res, next) {
  try {
    const {
      userId,
      notificationTitle,
      notificationBody,
      userEmailReq,
      emailType,
      userName,
    } = req.visualNotificationBody;

    const emailDatabase = await db.EmailModel.findOne({
      where: { emailType: emailType },
    });

    emailDatabase.dataValues["name"] = userName;


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

    await db.emailnotification.create({
      userId: userId,
      notificationTitle: notificationTitle,
      notificationBody: notificationBody,
    });

    next(); // Give control to next notification option
  } catch (error) {
    console.log(error);
  }
}

// Function to send push notification

async function addVisualAsNotification(req, res) {
  try {
    const byPasser = ["signInParent"];
    const {
      userId,
      notificationTitle,
      notificationBody,
      deviceToken,
      emailType,
      concurrentBlock,
      parentId,
    } = req.visualNotificationBody;
    // console.log(notificationTitle);

    if (deviceToken) {
      await db.visualnotification.create({
        userId: userId,
        parentId: parentId,
        notificationTitle: notificationTitle ? notificationTitle : "Error",
        notificationBody: notificationBody,
        deviceToken: deviceToken,
        notificationType: emailType,
      });

      if (!byPasser.includes(concurrentBlock)) {
        const message = {
          notification: {
            title: notificationTitle,
            body: notificationTitle,
          },
          token: deviceToken,
        };

        await admin.messaging().send(message);
      }
      // const params = {
      //     MessageBody: JSON.stringify({
      //         type: emailType,
      //         userId: userId
      //     }),
      //     MessageDeduplicationId: "TheWhistler",  // Required for FIFO queues
      //     MessageGroupId: "Group1",  // Required for FIFO queues
      //     QueueUrl: process.env.SQS_CLIENTLIENT_URL
      // };

      // SQS
      // sqs.sendMessage(params, (err) => {
      //     if (err) console.log(err);
      //     else console.log('Message sent');
      // }).promise()
      // const message = {
      //     notification: {
      //         title: 'Hello',
      //         body: 'This is a test push notification',
      //     },
      //     token: deviceToken
      // };

      // await firebaseAdmin.messaging().send(message)
    }
  } catch (error) {
    console.log(error);
  }
}

// function to send fcm notification
async function sendFCMNotification(notificationBody) {
  try {
    const deviceToken = notificationBody?.deviceToken;
    // console.log(deviceToken);
    if (deviceToken) {
      const message = {
        notification: {
          title: notificationBody?.notificationTitle,
          body: notificationBody?.notificationBody,
        },
        token: notificationBody.deviceToken,
      };

      await admin.messaging().send(message);
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  sendEmailAsNotification,
  addVisualAsNotification,
  sendFCMNotification,
};

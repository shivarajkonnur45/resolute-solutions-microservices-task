const { client } = require("../cache/subscription.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Subscription check middleware is for subscription need videos
async function subscriptionCheck(req, res, next) {
  try {
    const { token, courseId } = req.query;
    if (!token || !courseId) {
      return res.status(400).json({
        message: "You are not authorized to access this api",
      });
    }

    const verified = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log(verified);
    if (!verified) {
      return res.status(404).json({
        message: "Invalid token! Login Again",
      });
    }
    let studentID = null;
    let studentUniqueId = null;

    const isArrayValidate = Array.isArray(verified.accountDetail);
    if (isArrayValidate == true) {
      studentID = verified.accountDetail[0].UserID.toString();
      studentUniqueId = verified.accountDetail[0].uniqueID.toString();
    }
    if (isArrayValidate == false) {
      studentID = verified.accountDetail.UserID.toString();
      studentUniqueId = verified.accountDetail.uniqueID.toString();
    }

    const isSub = await client.get(studentID);
    // console.log(isSub);

    // if (!isSub || isSub != 1) {
    //   return res.status(400).json({
    //     message: "You do not have valid plans",
    //   });
    // }

    req.unId = studentUniqueId + courseId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

// Subscription bypass middleware is for free video

async function freeVideos(req, res, next) {
  try {
    const { Vurl } = req.query;
    if (!Vurl) {
      return res.status(400).json({
        message: "Invalid Video Url",
      });
    }

    const urlArr = Vurl.split("_");
    const vType = urlArr[0];
    const allowedVideos = ["CourseVideo", "ModuleVideo", "helpVideo", "EventVideo", "PromotionVideoVideo", "OnboardingVideoVideo"];

    if (!vType || !allowedVideos.includes(vType)) {
      return res.status(400).json({
        message: "Invalid Video Type",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function plannerTimeCheck(req, res, next) {
  try {
    const { unId } = req;
    // console.log(unId);
    if (!unId || unId == null) {
      return res.status(400).json({
        message: "Please stream during your time slot"
      })
    }

    const isPerfectForStream = await client.get(unId);

    if (!isPerfectForStream || isPerfectForStream != 1) {
      return res.status(400).json({
        message: "Please stream during your time slot"
      })
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

module.exports = { subscriptionCheck, freeVideos, plannerTimeCheck };

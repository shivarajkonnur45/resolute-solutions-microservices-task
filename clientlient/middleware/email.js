const db = require("../models/index");
const cryptoJS = require("crypto-js");

async function checkOneDayCoolDown(req, res, next) {
  try {
    const { AccDetails } = req;

    if (!AccDetails || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid Token Login Again",
      });
    }

    const { email } = req.body;
    if (!email || email.length == 0) {
      return res.status(400).json({
        message: "Invalid email",
      });
    }
    const parsedEmail = JSON.parse(email);
    // console.log(parsedEmail, email);
    const bytesEmail = cryptoJS.AES.decrypt(parsedEmail[0].email, process.env.SECRET);
    const originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);
    // console.log(originalEmail);
    // console.log(AccDetails.UserID);

    const isInFreeze = await db.freezeInvite.findOne({
      where: {
        userEmail: originalEmail,
        companyId: AccDetails.UserID,
      },
    });

    if (isInFreeze) {
      return res.status(400).json({
        message: "Your account is currently in freeze! Wait for 24 hours",
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

module.exports = { checkOneDayCoolDown };

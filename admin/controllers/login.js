const { admin, staffAdmin } = require("../models/index");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
require("dotenv").config();

async function login(req, res, next) {
  try {
    const { Email, emailThere } = req.body;

    if (!Email) {
      res.status(404).json({
        message: "All Fields are neccessary",
      });
    } else {
      const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
      const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
      // // console.log(originalEmail);
      const emailExist = await staffAdmin.findOne({
        where: {
          staffEmail: originalEmail,
        },
      });
      // const allData = await staffAdmin.findAll({});
      // console.log(allData);
      // console.log(emailExist);
      if (!emailExist) {
        res.status(404).json({
          message: "Email Not Found",
        });
      } else {
        if (emailThere == 1) {
          return res.status(200).json({
            message: "Email Exist",
          });
        } else {
          req.PK = emailExist.StaffID;
          next();
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

module.exports = login;

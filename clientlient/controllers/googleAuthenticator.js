const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const db = require("../models/index");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const client = new OAuth2Client(process.env.CLIENT_ID);

async function googleAuth(req, res) {
  if (!req.headers.authorization) {
    return res.status(404).json({
      message: "token not found",
    });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(404).json({
      message: "Oops! There was an error while authentication! Login Again",
    });
  } else {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
      });
      if (!ticket) {
        return res.status(401).json({
          message: "There was an error with validation",
        });
      } else {
        const output = ticket.getPayload();
        const encryptedEmail = cryptoJS.AES.encrypt(
          output.email,
          process.env.SECRET
        ).toString(); // Encrypting mail before storing it
        const alreadyExist = await db.useremail.findOne({
          where: { Email: output.email },
        });

        if (alreadyExist) {
          await db.useremail.update(
            { IsActive: "1" },
            { where: { UserID: alreadyExist.UserID } }
          );
          await db.user.update(
            { IsActive: 1 },
            { where: { UserID: alreadyExist.UserID } }
          );
          const tokenJwt = await jwt.sign(
            {
              accountDetail: {
                UserID: alreadyExist.UserID,
                uniqueID: alreadyExist.uniqueID,
                FirstName: output.given_name,
                LastName: output.family_name,
                Email: encryptedEmail,
                AccountType: alreadyExist.AccountType,
              },
            },
            process.env.JWT_SECRET
          );
          return res.status(200).json({
            message: `Welcome back! ${output.given_name}`,
            FirstName: output.given_name,
            LastName: output.family_name,
            AccountType: 3,
            token: tokenJwt,
          });
        } else {
          const selfGeneratedPassword = "GoogleLogin-" + uuidv4();
          const userCreated = await db.user.create({
            // Adding user data from google login to user db
            FirstName: output.given_name,
            LastName: output.family_name,
            Email: encryptedEmail,
            Password: selfGeneratedPassword,
            AccountType: 3,
          });
          await db.useremail.create({
            UserID: userCreated.UserID,
            Email: output.email,
          }); // Add Email from google login to useremail db
          await db.FreeTrail.create({
            UserID: userCreated.UserID,
            LastModifiedBy: "Google Auth",
          }); // Give Parent Free Trail
          const tokenJwt = await jwt.sign(
            {
              accountDetail: {
                UserID: userCreated.UserID,
                uniqueID: userCreated.uniqueID,
                FirstName: output.given_name,
                LastName: output.family_name,
                Email: encryptedEmail,
                AccountType: 3,
              },
            },
            process.env.JWT_SECRET
          );
          return res.status(200).json({
            message: `You are on board! ${output.given_name}`,
            FirstName: output.given_name,
            LastName: output.family_name,
            AccountType: 3,
            token: tokenJwt,
          });
        }
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message:
          "Invalid token! This may happen due to invalid syntax or expired token",
      });
    }
  }
}

async function facebookAuth(req, res) {
  try {
    const { fullName, email, fbId } = req.body;
    const encryptedEmail = cryptoJS.AES.encrypt(
      email,
      process.env.SECRET
    ).toString(); // Encrypting mail before storing it
    const alreadyExist = await db.useremail.findOne({
      where: { Email: email },
    });
    const nameParts = await fullName.split(" ");
    const firstName = nameParts[0] ? nameParts[0] : fullName;
    const lastName = nameParts[1] ? nameParts[1] : fullName;
    if (alreadyExist) {
      const tokenJwt = await jwt.sign(
        {
          accountDetail: {
            UserID: alreadyExist.UserID,
            uniqueID: alreadyExist.uniqueID,
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            AccountType: 3,
          },
        },
        process.env.JWT_SECRET
      );
      return res.status(200).json({
        message: `Welcome back! ${firstName}`,
        FirstName: firstName,
        LastName: lastName,
        AccountType: 3,
        token: tokenJwt,
      });
    }

    const selfGeneratedPassword = "FacebookLogin-" + fbId;
    const userCreated = await db.user.create({
      // Adding user data from google login to user db
      FirstName: firstName,
      LastName: lastName,
      Email: encryptedEmail,
      Password: selfGeneratedPassword,
      AccountType: 3,
    });
    await db.useremail.create({ UserID: userCreated.UserID, Email: email }); // Add Email from google login to useremail db
    const tokenJwt = await jwt.sign(
      {
        accountDetail: {
          UserID: userCreated.UserID,
          uniqueID: userCreated.uniqueID,
          FirstName: firstName,
          LastName: lastName,
          Email: encryptedEmail,
          AccountType: 3,
        },
      },
      process.env.JWT_SECRET
    );
    return res.status(200).json({
      message: `You are on board! ${firstName}`,
      FirstName: firstName,
      LastName: lastName,
      AccountType: 3,
      token: tokenJwt,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message:
        "Invalid token! This may happen due to invalid syntax or expired token",
    });
  }
}

module.exports = { googleAuth, facebookAuth };

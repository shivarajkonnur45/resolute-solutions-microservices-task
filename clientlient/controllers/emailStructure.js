const db = require("../models/index");
const emailStruct = require("../Data/emailStruct");

// Function to send column and value
async function sendEmailColumns(req, res) {
  try {
    const { emailType } = req.query;
    if (!emailType) {
      return res.status(400).json({
        message: "Invalid email type",
      });
    }

    const emailStructure = await db.EmailModel.findOne({
      where: { emailType: emailType },
      attributes: {
        exclude: ["emailType", "LastModifiedOn", "LastModifiedBy"],
      },
    });

    // const emailStructure = emailStruct[emailType];

    return res.status(200).json({
      emailStructure: emailStructure,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

// function to edit email structure
async function editEmailContent(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails) {
      return res.status(400).json({
        message: "Invalid Token! Login again",
      });
    }
    const { emailType } = req.query;
    if (!emailType) {
      return res.status(400).json({
        message: "Invalid email type",
      });
    }

    const { emailContent } = req.body;

    emailContent.LastModifiedBy =
      AccDetails.FirstName + " " + AccDetails.LastName;
    emailContent.LastModifiedOn = Date.now();

    await db.EmailModel.update(emailContent, {
      where: { emailType: emailType },
    });

    return res.status(200).json({
      message: "Email Structure Updated!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

// Create the default values for the email
async function createDefaultValues() {
  try {
    const GREEN = "\x1b[32m";
    const YELLOW = "\x1b[33m";
    const RED = "\x1b[31m";
    const RESET = "\x1b[0m";
    const emailData = await db.EmailModel.findAll({});
    const countEmail = emailData.length;
    const reqCount = emailStruct.length; // For production
    // const reqCount = process.env.EMAIL_COUNT; // For testing

    if (countEmail != reqCount) {
      console.log(
        `${YELLOW}Warning! The values for email default are not same.\nDatabase count -> ${countEmail}, Value to feed count -> ${reqCount}${RESET}\n${RED}>>>> This can cause infinite data input.${GREEN}(Ignore for first time on server start & Safe if Database count is 0)${RESET}`
      );
      const created = await db.EmailModel.bulkCreate(emailStruct);
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = { sendEmailColumns, editEmailContent, createDefaultValues };

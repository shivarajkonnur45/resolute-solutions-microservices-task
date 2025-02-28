const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { CourseModel } = require("../models/index");
require("dotenv").config();

const uploadsDir = path.join(__dirname, "..", "/volume/Thumbnail/");
fs.ensureDirSync(uploadsDir);

const generateCertificate = async (req, res) => {
  try {
    const { CourseId } = req.query;
    // console.log(CourseId);
    if (!CourseId) {
      return res.status(404).json({
        message: "Invalid Course Id",
      });
    } else {
      const courseData = await CourseModel.findByPk(CourseId);
      if (!courseData) {
        return res.status(404).json({
          message: "Invalid Course Id",
        });
      } else {
        // console.log(`object`);
        const adminUrl = process.env.HTTP_REQUEST_ADMIN;
        const reqAdminUrl = await adminUrl.replace("api/v1/", "");
        // console.log(reqAdminUrl);
        const courseCertificateImage =
          reqAdminUrl + "Thumbnail/" + courseData.certificateImage;
        // console.log(courseCertificateImage);
        // console.log(courseCertificateImage.buffer);
        return res.status(200).json({
          certificateImage: courseCertificateImage,
          trophyImage: courseData.trophyImage,
        });
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(400).send({ error: err.message });
  }
};

// Helper function to sanitize filenames (remove special characters)
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, ""); // Replace characters not allowed in filenames
}

module.exports = generateCertificate;

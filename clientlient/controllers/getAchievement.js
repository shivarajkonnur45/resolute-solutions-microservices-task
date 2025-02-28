const db = require('../models/index');
const axios = require('axios');
require('dotenv').config();

async function getLessonBadges(req, res) {
    try {
        const { AccDetails } = req;
        if (!AccDetails || !AccDetails.UserID) {
            return res.status(401).json({
                message: "Invalid Token Login Again"
            })
        }
        else {
            const allLessonBadges = await db.clientachievement.findAll({
                where: {
                    UserID: AccDetails.UserID
                }
            });
            return res.status(200).json({
                message: "Your Lessons Achievements",
                lessonBadges: allLessonBadges
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

async function getCourseCertificate(req, res) {
    try {
        const { AccDetails } = req;
        if (!AccDetails || !AccDetails.UserID) {
            return res.status(401).json({
                message: "Invalid Token Login Again"
            })
        }
        else {
            const certificateForUser = await db.clientachievementCourse.findAll({ where: { UserID: AccDetails.UserID } });
            if (certificateForUser && certificateForUser.length > 0) {

                const removedUserIdAndImage = await Promise.all(certificateForUser.map(async (singleCertificate) => {
                    const adminUrl = process.env.HTTP_REQUEST_ADMIN;
                    const token = process.env.HTTP_REQUEST_SECRET_KEY;
                    singleCertificate.UserID = null; // Removing User id for security purpose
                    singleCertificate.certificateImage = null; // Removing Certificate image for security purpose
                    singleCertificate.dataValues.courseTitle = null; // Adding Course Title
                    singleCertificate.dataValues.certificateTitle = null; // Adding Certificate Title
                    const courseCertifcateTitle = await axios.get(`${adminUrl}/courseCertificateTitle?CourseId=${singleCertificate.CourseID}`, {
                        headers: { "Authorization": "Bearer " + token }
                    });
                    // console.log(courseCertifcateTitle);
                    if (courseCertifcateTitle.data) {
                        singleCertificate.dataValues.courseTitle = courseCertifcateTitle.data.courseTitle;
                        singleCertificate.dataValues.certificateTitle = courseCertifcateTitle.data.certificateTitle;
                    }
                    //Adding user name 
                    const userDataForName = await db.user.findByPk(AccDetails.UserID);
                    const userName = userDataForName.FirstName + " " + userDataForName.LastName;
                    singleCertificate.dataValues.userFullName = userName; // Appending UserName

                    //Parsing json data for frontend (currently not needed, if needed uncomment)
                    // if (singleCertificate.certificateBuffer) {
                    //     // const parsedImageBuffer = JSON.parse(singleCertificate.certificateBuffer);
                    //     singleCertificate.certificateBuffer = singleCertificate.certificateBuffer;
                    // }
                    return singleCertificate;
                }));
                return res.status(200).json({
                    message: "Certificate for user",
                    certificateData: removedUserIdAndImage
                })
            }
            else {
                return res.status(200).json({
                    message: "Sorry! You do not have any achievement unlocked! Complete Videos",
                    certificateData: certificateForUser
                })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

async function getCertificate(req, res) {
    try {
        const { AccDetails } = req;
        if (!AccDetails || !AccDetails.UserID) {
            return res.status(401).json({
                message: "Invalid Token Login Again"
            })
        }

        const { courseId } = req.query;

        const userCertificate = await db.clientachievementCourse.findOne({
            where: { UserID: AccDetails.UserID, CourseID: courseId }
        });
 
        if (!userCertificate || !userCertificate?.certificateImage) {
            return res.status(400).json({
                message: "No data present at moment"
            })
        }
        return res.status(200).json({
            certificateUrl: userCertificate.certificateImage
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Sorry! There was an server-side error'
        });
    }
}

module.exports = { getLessonBadges, getCourseCertificate, getCertificate };
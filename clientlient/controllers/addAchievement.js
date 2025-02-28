const db = require('../models/index');
const axios = require('axios');
require('dotenv').config();
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const notificationBody = require('../notifcationStructure/notificationStruct');

async function addBadgeAchievement(req, res) {
    try {
        const { UserID } = req.query;
        if (!UserID) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        else {
            const userExist = db.user.findByPk(UserID);
            if (!userExist) {
                return res.status(404).json({
                    message: "User not found"
                })
            }
            else {
                const { LessonID, CourseID, quizScore } = req.query;
                if (!CourseID || !LessonID) {
                    return res.status(401).json({
                        message: "Course/Lessons Not found"
                    })
                }
                else {
                    const alreadyExistAchievement = await db.clientachievement.findOne({
                        where: {
                            UserID: UserID,
                            CourseID: CourseID,
                            LessonID: LessonID
                        }
                    });
                    if (alreadyExistAchievement) {
                        return res.status(200).json({
                            message: "You have already done with this achievement"
                        })
                    }
                    else {
                        const achievementCreated = await db.clientachievement.create({
                            UserID: UserID,
                            CourseID: CourseID,
                            LessonID: LessonID
                        });
                        try {
                            const url = process.env.HTTP_REQUEST_ADMIN;
                            const activityUrl = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
                            const token = process.env.HTTP_REQUEST_SECRET_KEY;

                            const respBadgeLength = await axios.get(`${url}/lessonBadgeLength?CourseId=${CourseID}&LessonId=${LessonID}`, {
                                headers: { "Authorization": "Bearer " + token }
                            });

                            const respBadgeImage = await axios.get(`${url}/lessonBadgeImage?LessonId=${LessonID}`, {
                                headers: { "Authorization": "Bearer " + token }
                            });

                            const respTitles = await axios.get(`${url}/courseTrophyTitle?CourseId=${CourseID}`, {
                                headers: { "Authorization": "Bearer " + token }
                            });
                            if (respBadgeLength.data.lessonBadgeCount != undefined || respBadgeLength.data.lessonBadgeCount != null) {
                                await db.clientachievement.update({ totalBadgeCount: respBadgeLength.data.lessonBadgeCount, lessonBadgeCount: respBadgeLength.data.specBadgeCount }, { where: { achievementId: achievementCreated.achievementId } }); // Update total badge count through http call
                            }
                            if (respBadgeImage.data.badgeImage) {
                                const lessonData = respBadgeImage.data.badgeImage;
                                await db.clientachievement.update({ badgeDesc: lessonData }, { where: { achievementId: achievementCreated.achievementId } });
                            }
                            if (respTitles.data.courseTitle) {
                                await db.clientachievement.update({ courseTitle: respTitles.data.courseTitle }, { where: { achievementId: achievementCreated.achievementId } });
                            }
                            if (respTitles.data.trophyTitle) {
                                await db.clientachievement.update({ trophyTitle: respTitles.data.trophyTitle }, { where: { achievementId: achievementCreated.achievementId } });
                            }

                            await axios.put(
                                `${activityUrl}/report/updateQuizStatus?lessonId=${LessonID}&courseId=${CourseID}&studentId=${UserID}&LessonBadgeCount=${respBadgeLength.data.specBadgeCount}&quizScore=${quizScore}`,
                                {},
                                {
                                    headers: { Authorization: "Bearer " + token },
                                }
                            );

                            return res.status(200).json({
                                message: "Achievement Unlocked"
                            })
                        } catch (error) {
                            console.log(error);
                            if (error.response) {
                                return res.status(error.response.status).json({
                                    message: error.response.data.message
                                })
                            }
                            else {
                                return res.status(500).json({
                                    message: "Something went wrong"
                                })
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

//! Certificate Achievement
async function addCourseCertificate(req, res) {
    try {
        const { UserID, CourseID } = req.query;
        if (!UserID || !CourseID) {
            return res.status(404).json({
                message: "No User/Course Match found"
            })
        }
        else {
            const userData = await db.user.findByPk(UserID);
            if (!userData) {
                return res.status(404).json({
                    message: "User not found"
                })
            }
            else {
                const alreadyCompletedCourse = await db.clientachievementCourse.findOne({ where: { UserID: UserID, CourseID: CourseID } });
                await db.flow.update(
                    { IsActive: '0' },
                    {
                        where: { StudentID: userData.UserID, ParentID: userData.ParentID, CourseIDs: CourseID }
                    }
                )
                if (!alreadyCompletedCourse) {
                    try {
                        const userFullName = userData.FirstName + " " + userData.LastName; // Getting the name for the user who got certificate

                        const adminUrl = process.env.HTTP_REQUEST_ADMIN;
                        const token = process.env.HTTP_REQUEST_SECRET_KEY;
                        // console.log(`%%%%%%%%%%%%%%%%%%%%%%%%%%`);
                        // console.log(adminUrl);
                        // console.log(`%%%%%%%%%%%%%%%%%%%%%%%%%%`);
                        const respGeneratedCertficate = await axios.get(`${adminUrl}/generateCertificate?CourseId=${CourseID}`, {
                            headers: { "Authorization": "Bearer " + token }
                        });

                        registerFont(path.join(__dirname, '..', '/fonts/', 'Roboto-Medium.ttf'), { family: 'Roboto', weight: '500' });
                        registerFont(path.join(__dirname, '..', '/fonts/', 'Roboto-Bold.ttf'), { family: 'Roboto', weight: '700' });
                        registerFont(path.join(__dirname, '..', '/fonts/', 'Roboto-Black.ttf'), { family: 'Roboto', weight: '900' });

                        const uploadDir = registerFont(path.join(__dirname, '..', '/fonts/', 'Roboto-Medium.ttf'), { family: 'Roboto', weight: '500' })

                        // Generate the date
                        function formatDate(date) {
                            const options = {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            };

                            return new Intl.DateTimeFormat('en-US', options).format(date);
                        }

                        const targetDate = new Date(Date.now()); // Get current date and time
                        const formattedDate = formatDate(targetDate);
                        const usernameLength = userFullName.length; // Storing user name length to make positioning dynamic
                        // Static positions to align name and essentials data on certificates
                        const helperForCertificateGenerator = {
                            studentName: userFullName,
                            studentNamePosX: usernameLength > 12 ? "725" : "710",
                            studentNamePosY: "405",
                            date: formattedDate,
                            datePosX: "720",
                            datePosY: "735"
                        }

                        let image = respGeneratedCertficate.data.certificateImage;
                        let extension = null;
                        if (image) {
                            const extensionArr = image.split(".");
                            extension = extensionArr[extensionArr.length - 1];
                        }
                        async function addTextToImage(imagePath, studentName, studentNamePosX, studentNamePosY, date, datePosX, datePosY) {
                            const img = await loadImage(imagePath);
                            const canvas = createCanvas(img.width, img.height);
                            const ctx = canvas.getContext('2d');

                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                            ctx.font = '700 32px Roboto';
                            ctx.fillStyle = '#424242';
                            ctx.textBaseline = 'top';

                            const studentNameParts = studentName.split(' - ');
                            const line1 = studentNameParts[0];
                            const line2 = studentNameParts.length > 1 ? studentNameParts[1] : '';

                            // Add student's name at specified position
                            ctx.fillText(line1, studentNamePosX, studentNamePosY);
                            if (line2) {
                                ctx.fillText(line2, studentNamePosX, studentNamePosY + 40); // Line height spacing
                            }

                            // Set text properties for date
                            ctx.font = '700 20px Roboto';
                            ctx.fillStyle = '#000000';
                            ctx.textAlign = 'left';
                            ctx.textBaseline = 'top';

                            // Add date at specified position
                            ctx.fillText(date, datePosX, datePosY);

                            return canvas.toBuffer('image/jpeg', { quality: 80 });
                        }
                        const modifiedImageBuffer = await addTextToImage(
                            image,
                            helperForCertificateGenerator.studentName,
                            parseInt(helperForCertificateGenerator.studentNamePosX),
                            parseInt(helperForCertificateGenerator.studentNamePosY),
                            helperForCertificateGenerator.date,
                            parseInt(helperForCertificateGenerator.datePosX),
                            parseInt(helperForCertificateGenerator.datePosY)
                        );
                        const toSend = path.join(__dirname, '..', '/volume/certificates/');
                        let toSave = helperForCertificateGenerator.studentName + Date.now() + "." + extension;
                        const newDir = toSend + toSave.replace(" ", "");
                        fs.writeFile(newDir, modifiedImageBuffer, (err) => {
                            if (err) console.log(err);
                            console.log('The file has been saved:', toSend);
                        });
                        // console.log(modifiedImageBuffer.buffer.data);

                        //Certificate generated now save it to db
                        await db.clientachievementCourse.create({
                            UserID: UserID,
                            CourseID: CourseID,
                            certificateBuffer: "modifiedImageBuffer",
                            certificateImage: toSave.replace(" ", "")
                        });

                        const trophyImage = respGeneratedCertficate.data.trophyImage;

                        await db.clientachievement.update(
                            {trophyImage: trophyImage},
                            {where:{ UserID : UserID, CourseID :CourseID }}
                        )


                        return res.status(200).json({
                            message: "Congratulations! Your Certificate is ready"
                        })
                    } catch (error) {
                        console.log(error);
                        return res.status(500).json({
                            message: "There was an error while generating Certificate",
                            cause: "This might happen because of axios fail or writing name on certificate"
                        })
                    }
                }
                else {
                    return res.status(200).json({
                        message: "Keep going! Your have already achieved this milestone"
                    })
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

module.exports = { addBadgeAchievement, addCourseCertificate };
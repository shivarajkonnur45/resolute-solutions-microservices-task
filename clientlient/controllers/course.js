const axios = require('axios');
const db = require('../models/index');
const { Op } = require("sequelize");

async function getCourseForParent(req, res) {
    try {
        const url = process.env.HTTP_REQUEST_ADMIN;
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const { gradeArray } = req.params;
        const { Page } = req.params;
        const { StudentId } = req.params;
        const courseData = await axios.get(`${url}/coursebygrade/${gradeArray}/${Page}`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (courseData.data.data) {
            // console.log(courseData.data.data);
            if (StudentId && StudentId != 'undefined') {
                let outputNeed = [];
                let flowsID = [];
                await Promise.all(courseData.data.data.map(async (single) => {
                    const flowExist = await db.flow.findOne({ where: { StudentID: StudentId, CourseIDs: { [Op.like]: `%${single.courseId}%` } } });;
                    if (flowExist && !flowsID.includes(flowExist.FlowID)) {
                        single.isInFlow = 1;
                        outputNeed.push(single);
                        flowsID.push(flowExist.FlowID);
                    }
                    else {
                        single.isInFlow = 0;
                        outputNeed.push(single);
                    }
                }));
                return res.status(200).json({
                    message: "Course Data",
                    Data: outputNeed
                })
            }
            else {
                return res.status(200).json({
                    message: "Course Data",
                    Data: courseData.data.data
                })
            }
        }
        else {
            return res.status(500).json({
                message: "Something went wrong"
            })
        }
    } catch (error) {
        console.log(error);
        if (error.response) {
            res.status(error.response.status).json({
                message: error.response.data.message
            })
        }
        else {
            res.status(500).json({
                message: "Something went wrong"
            })
        }
    }
}

async function getCourseByID(req, res) {
    try {
        const url = process.env.HTTP_REQUEST_ADMIN;
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const CourseId = req.params.CourseId;
        const courseData = await axios.get(`${url}/courseGetID/${CourseId}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        return res.status(200).json({
            message: "Course Data",
            Data: courseData.data.Data
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

async function getCourseForStudent(req, res) {
    try {
        const { AccDetails } = req;
        // console.log(AccDetails.UserID);
        if (!AccDetails || !AccDetails.UserID) {
            return res.status(404).json({
                message: "User not found! Login again"
            })
        }
        else {
            const page = req.query.page ? req.query.page : 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            let currentDate = new Date();

            currentDate = currentDate.toJSON().split("T")[0];

            // Calculate the date 1 week from now
            let oneWeekFromNow = new Date(currentDate);
            oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
            oneWeekFromNow = oneWeekFromNow.toJSON().split("T")[0];

            // console.log(currentDate);
            // console.log(oneWeekFromNow)

            let whereCondition = {};

            whereCondition = {
              [Op.or]: [
                {
                  StartDate: {
                    [Op.between]: [currentDate, oneWeekFromNow]
                  }
                },
                {
                  EndDate: {
                    [Op.between]: [currentDate, oneWeekFromNow]
                  }
                },
                {
                  [Op.and]: [
                    {
                      StartDate: { [Op.lte]: currentDate } 
                    },
                    {
                      EndDate: { [Op.gte]: oneWeekFromNow }
                    }
                  ]
                }
              ]
            };

            whereCondition.StudentID = AccDetails.UserID;

            let courseIdArr = []; // Storing Course id from the data we got from flow
            let pathwayIdArr = []; // Storing Pathway id from the data we got from flow
            let outputResult = []; // Main result array which is sent in response
            let flowAppendToCourse = []; // Append the flow data to course if LearningStyle is 1

            // Flow data for Upcoming 1 Week Part
            const flowData = await db.flow.findAll({
                where: whereCondition,
                offset: offset,
                limit: limit
            });

            // console.log(flowData);

            // console.log(AccDetails.UserID);
            await flowData.map((singleFlow, index) => {
                // console.log(index, '-> Data ->' , singleFlow);
                if (singleFlow.CourseIDs != null) {
                    courseIdArr.push(singleFlow.CourseIDs);
                }
                if (singleFlow.PathwayIDs != null && singleFlow.PathwayIDs != '') {
                    pathwayIdArr.push(singleFlow.PathwayIDs);
                }

                if (singleFlow.LearningStyle == 0) {
                    const coursess = singleFlow.CourseIDs.split(",")
                    flowAppendToCourse = [...flowAppendToCourse, ...coursess]
                }
            })

            // console.log(courseIdArr);
            // console.log(pathwayIdArr);
            // console.log(AccDetails.UserID);
            // console.log(flowAppendToCourse);
            // console.log(courseIdArr);

            // 1. Course data for Upcoming 1 Week Part & Pathway Data for upcoming 1 week
            // A. Course Data for upcoming 1 Week
            if (courseIdArr.length > 0) {
                
                let filterArr = []; // Array to remove data duplication from course data
                const adminUrl = process.env.HTTP_REQUEST_ADMIN;
                const token = process.env.HTTP_REQUEST_SECRET_KEY;
                const respCourseData = await axios.get(`${adminUrl}/courseData?courseIDs=[${courseIdArr}]`, { //! Here i have added additional [] sign to explicity make it an array if any error occurs remove it
                    headers: { "Authorization": "Bearer " + token }
                });
                if (respCourseData.data.Data && respCourseData.data.Data.length > 0) {
                
                    const iteratingCourse = respCourseData.data.Data;
                    const result = iteratingCourse.map((singleCourse) => {
                        if (!filterArr.includes(singleCourse.courseId)) {
                            filterArr.push(singleCourse.courseId);
                            return singleCourse;
                        }
                    })
                    outputResult = [...result]; // Appending the result that is filtered out
                }
            }

            // B. Pathway Data for upcoming 1 Week
            if (pathwayIdArr.length > 0) {
                let filterArr = []; // Array to remove data duplication from pathway data
                const adminUrl = process.env.HTTP_REQUEST_ADMIN;
                const token = process.env.HTTP_REQUEST_SECRET_KEY;
                const respPathwayData = await axios.get(`${adminUrl}/pathwayByIDs?PathwayIDs=[${pathwayIdArr}]`, { //! Here i have added additional [] sign to explicity make it an array if any error occurs remove it
                    headers: { "Authorization": "Bearer " + token }
                });
                if (respPathwayData.data.Data && respPathwayData.data.Data.length > 0) {
                    const iteratingPathway = respPathwayData.data.Data;
                    const result = iteratingPathway.map((singleCourse) => {
                        if (!filterArr.includes(singleCourse.PathwayID)) {
                            filterArr.push(singleCourse.courseId);
                            return singleCourse;
                        }
                    })
                    outputResult = [...outputResult, ...result]; // Appending the result that is filtered out
                }
            }

            // 2. Course Data for user uncompleted Courses
            if (page == 1) {
                const streamingUrl = process.env.HTTP_REQUEST_CLIENT_STREAM;
                const token = process.env.HTTP_REQUEST_SECRET_KEY;

                const respUncompletedCourses = await axios.get(`${streamingUrl}/uncompletedCourse?UserId=${AccDetails.UserID}`, {
                    headers: { "Authorization": "Bearer " + token }
                });

                if (respUncompletedCourses.data.underProgressCourses && respUncompletedCourses.data.underProgressCourses.length > 0) {
                    const underProgress = respUncompletedCourses.data.underProgressCourses;
                    const courseUnderProgress = []; // Explicity defining it because we want all uncompleted course (No Filter Needed)
                    underProgress.map((singlePro) => {
                        courseUnderProgress.push(singlePro.CourseID);
                    });

                    // Course data for Uncompleted Courses
                    const adminUrl = process.env.HTTP_REQUEST_ADMIN;
                    const token = process.env.HTTP_REQUEST_SECRET_KEY;
                    const respCourseData = await axios.get(`${adminUrl}/courseData?courseIDs=[${courseUnderProgress}]`, { //! Here i have added additional [] sign to explicity make it an array if any error occurs remove it
                        headers: { "Authorization": "Bearer " + token }
                    });
                    if (respCourseData.data.Data && respCourseData.data.Data.length > 0) {
                        outputResult = [...outputResult, ...respCourseData.data.Data]; // Appending Unwatched Courses
                    }
                }
            }

            // 3. Course Data for user Latest completed Courses for Certificate Download (Current Data to be returned -> 1)
            if (page == 1) {
                const streamingUrl = process.env.HTTP_REQUEST_CLIENT_STREAM;
                const token = process.env.HTTP_REQUEST_SECRET_KEY;
                const respLatestCourseCompleted = await axios.get(`${streamingUrl}/latestCourse?UserId=${AccDetails.UserID}`, {
                    headers: { "Authorization": "Bearer " + token }
                });

                if (respLatestCourseCompleted.data.latestCompletedCourse) {
                    const completedCourse = respLatestCourseCompleted.data.latestCompletedCourse;
                    // Course data for Latest completed Courses
                    const adminUrl = process.env.HTTP_REQUEST_ADMIN;
                    const token = process.env.HTTP_REQUEST_SECRET_KEY;
                    const respCourseData = await axios.get(`${adminUrl}/courseData?courseIDs=[${completedCourse.CourseID}]`, { //! Here i have added additional [] sign to explicity make it an array if any error occurs remove it
                        headers: { "Authorization": "Bearer " + token }
                    });
                    if (respCourseData.data.Data && respCourseData.data.Data.length > 0) {
                        outputResult = [...outputResult, ...respCourseData.data.Data]; // Appending Latest Completed Courses
                    }
                }
            }
            
            // Filter the final result
            const finalRes = outputResult.filter((single)=> single != null);
            
            return res.status(200).json({
                Data: finalRes
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

// const CourseVideoByID = async (req, res) => {
//     console.log('ssssssssssssss');
//     console.log(process.env.HTTP_REQUEST_CLIENT_STREAM+'/coursevideo/get-coursevideo-http?UserID='+req.query.UserID+'&VideoName='+req.query.VideoName+'');
//     try {
//         const token = process.env.HTTP_REQUEST_SECRET_KEY;
//         const response = await axios.get(process.env.HTTP_REQUEST_CLIENT_STREAM+'/coursevideo/get-coursevideo-http?UserID='+req.query.UserID+'&VideoName='+req.query.VideoName+'', {
//             headers: { "Authorization": "Bearer " + token }
//         });
//         res.status(200).json(response.data)
//     } catch (error) {
//         res.status(500).json({
//             message: "Sorry! there was server-side error",
//             error : error.message
//         })
//     }
// }

module.exports = { getCourseForStudent, getCourseByID, getCourseForParent };
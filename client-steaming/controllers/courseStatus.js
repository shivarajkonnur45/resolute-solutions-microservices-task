// const db = require("../models/index");
// const axios = require("axios");

// // api to give the completion for the course user

// async function courseStatusStudent(req, res) {
//   try {
//     const { studentId } = req.query;

//     if (!studentId) {
//       return res.status(400).json({
//         message: "Invalid Token! Login Again",
//       });
//     }

//     const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
//     const token = process.env.HTTP_REQUEST_SECRET_KEY;

//     const respFlowData = await axios.get(
//       `${clientUrl}/planner/getFlow/Student?studentId=${studentId}`,
//       {
//         // We can optimize this api by setting offset and limit to this part,
//         headers: { Authorization: "Bearer " + token },
//       }
//     );

//     let dataToSend = [];

//     const flowRespData = respFlowData.data.flowData;
//     if (flowRespData && flowRespData.length > 0) {
//       for (let i = 0; i < flowRespData.length; i++) {
//         let objToPush = {};
//         objToPush.progress = 0;
//         objToPush.QuizTotal = 0;
//         objToPush.CompletedQuiz = 0;

//         const courseCompletion = await db.CourseCompletion.findOne({
//           where: { CourseID: flowRespData[i].CourseIDs },
//         });
//         if (courseCompletion) {
//           objToPush.progress =
//             (courseCompletion.TotalCourseProgress /
//               courseCompletion.TotalVideoCount) *
//             100;
//         }

//         const lessonIdArray = flowRespData[i].LessonIDs.split(",");
//         console.log(lessonIdArray);

//         if (lessonIdArray && lessonIdArray.length > 0) {
//           const adminUrl = process.env.HTTP_REQUEST_ADMIN;
//           const token = process.env.HTTP_REQUEST_SECRET_KEY;

//           const lessonQuizCount = await axios.get(
//             `${adminUrl}/lessonQuizCount?lessonArr=[${lessonIdArray}]`,
//             {
//               headers: { Authorization: "Bearer " + token },
//             }
//           );
//           objToPush.QuizTotal = lessonQuizCount.data.lessonQuizCount;

//           for (let j = 0; j < lessonIdArray.length; j++) {
//             const lessonIsCompeleted = await db.CourseVideo.findOne({
//               where: {
//                 LessonID: lessonIdArray[j],
//                 UserID: studentId,
//                 Status: 1,
//               },
//             });

//             if (lessonIsCompeleted) {
//               objToPush.CompletedQuiz = objToPush.CompletedQuiz + 1;
//             }
//           }
//         }

//         dataToSend.push(objToPush);
//       }
//     }

//     return res.status(200).json({
//       message: "Student Detailed Report",
//       Data: dataToSend,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({
//       message: "Sorry! There was an server-side error",
//     });
//   }
// }

// module.exports = { courseStatusStudent };

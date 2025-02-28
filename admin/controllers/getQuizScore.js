const { lessonquiz } = require("../models/index");
const axios = require("axios");
require("dotenv").config();

// async function pythonCheck() {
//     try {
//         const url = 'http://127.0.0.1:5000/storeEmails'

//         const resp = await axios.post(url,{"userData":{
//             "bookInterest":['Adventure', 'Scary', 'Love story'],
//             "book1": "Romeo Juliet",
//             "book2": "Tails of Juliet",
//             "book3":"Arabian Nights",
//             "book4":"",
//             "book5":"",
//             "author1": "William Shakspere",
//             "author2":"Robert Frost",
//             "author3":"",
//             "bookPrefer":"Love Stories",
//             "valueQualities": ['Height', 'Reading Fluent', 'Extrovert'],
//             "readingTastePartner": "yes",
//             "ageRangePartner": 21,
//             "genderPreferPartner": "female",
//             "differentGeolocation":"no",
//             "fullName": "Ashwin",
//             "email":"vivek@resolutesolutions.in",
//             "password":"123",
//             "location":"india",
//             "age":24,
//             "gender":"male",
//             "sentStatus":0
//         }});

//         console.log(resp);
//     } catch (error) {
//         console.log(error);
//     }
// }
// pythonCheck()

async function getQuizScore(req, res) {
  try {
    const { AccDetails } = req;
    const { LessonID, CourseId } = req.query;
    const { userSubmissions } = req.body;
    // console.log(userSubmissions);
    if ((!LessonID || !AccDetails, !CourseId || !userSubmissions)) {
      return res.status(404).json({
        message: "All Fields are neccessary",
      });
    } else {
      let rightAnswerCount = 0;
      const mapping = new Map();
      const allLessonLinkedQuiz = await lessonquiz.findAll({
        where: { LessonID: LessonID },
      });

      if (allLessonLinkedQuiz && allLessonLinkedQuiz.length > 0) {
        for(let i =0; i<allLessonLinkedQuiz.length; i++){
            mapping.set(allLessonLinkedQuiz[i].Position,allLessonLinkedQuiz[i].RightAnswer);
          }
    
          const parsedSubmission = JSON.parse(userSubmissions);
    
          if(!parsedSubmission){
            return res.status(400).json({
                message:"Error while parsing"
            })
          }
    
          for(let j=0;j<parsedSubmission.length;j++){
            const answerRight = mapping.get(parsedSubmission[j].Position);
            const arrAnswer = answerRight.split(",");
            for(let k=0;k<parsedSubmission[j].RightAnswer.length;k++){
                if(arrAnswer.includes(parsedSubmission[j].RightAnswer[k].toString())){
                    rightAnswerCount = rightAnswerCount + 1;
                }
            }
          }

        const quizScore = Math.floor(
          (rightAnswerCount / allLessonLinkedQuiz.length) * 100
        ); // Calculating score in %
        await axios.get(
          `${process.env.HTTP_REQUEST_CLIENT_STREAM}/quiz-http-score?UserID=${AccDetails.UserID}&quizScore=${quizScore}&LessonId=${LessonID}&CourseId=${CourseId}`,
          {
            // Pushing the quiz score to the client streaming table for progress check
            headers: { Authorization: "Bearer " + process.env.HTTP_REQUEST_SECRET_KEY },
          }
        );
        return res.status(200).json({
          message: "Your Quiz Score is here",
          yourScore: rightAnswerCount,
          outOf: allLessonLinkedQuiz.length,
        });
      } else {
        return res.status(200).json({
          message: "Your Quiz Score is here",
          yourScore: 0,
          outOf: 0,
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while fetching score",
    });
  }
}

module.exports = getQuizScore;

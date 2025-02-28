const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const axios = require('axios');
const db = require('../models/index');
const Sequelize = require('sequelize');
const { signUpSchema } = require('../helper/validation');
const { Op } = require("sequelize");
const notificationBody = require('../notifcationStructure/notificationStruct');

// const add_student = async (MessageBody) => {
//     console.log('MessageBody',MessageBody)

//     const { Email} = MessageBody;

//     const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
//     const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);

//     const emailExist = await db.useremail.findOne({
//         where:{
//             Email : originalEmail
//         }
//     });

//     if(emailExist){
//         return "Email already exits";
//     }
//     try {
//         const newUser = await db.user.create({
//             Grade : MessageBody.Grade,
//             FirstName : MessageBody.FirstName,
//             LastName : MessageBody.LastName,
//             Email : Email,
//             Password : MessageBody.Password,
//             PhoneNumber : MessageBody.PhoneNumber,
//             IsParticipateCompetitions : MessageBody.IsParticipateCompetitions,
//             IsActive : MessageBody.IsActive,
//             CreatedBy : 'Admin',
//             LastModifiedBy : 'Admin',
//             AccountType : 1,
//             ParentID : MessageBody.ParentID
//         });
//         await db.useremail.create({
//             UserID : newUser.UserID,
//             Email : originalEmail
//         });
//         return "Student addedd successfully"
//     } catch (error) {
//         return "Sorry! there was server-side error"
//     }

// }


// const update_student = async (MessageBody) => {
//     try {

//         const userExist = await db.user.findOne({
//             where: {
//                 UserID: MessageBody.StudentID,
//                 ParentID: MessageBody.ParentID,
//                 AccountType: 1
//             }
//         });
//         if (!userExist) {
//             return "Student not exits"
//         }
//         try {
//             var data = {
//                 Grade: MessageBody.Grade,
//                 FirstName: MessageBody.FirstName,
//                 LastName: MessageBody.LastName,
//                 PhoneNumber: MessageBody.PhoneNumber,
//                 IsParticipateCompetitions: MessageBody.IsParticipateCompetitions,
//                 IsNoSuPeAchPoQu: MessageBody.IsNoSuPeAchPoQu,
//                 IsLookFeedback: MessageBody.IsLookFeedback,
//                 IsActive: MessageBody.IsActive,
//                 CreatedBy: 'Admin',
//                 LastModifiedBy: 'Admin'
//             }

//             if (MessageBody.Password) {
//                 if (MessageBody.Password != '') {
//                     data.Password = MessageBody.Password;
//                 }
//             }

//             //---User history table-------------------------------------------//
//             const UserIDWiseData = await db.user.findOne({
//                 where: { UserID: MessageBody.StudentID },
//             });

//             if (!UserIDWiseData) {
//                 return res
//                     .status(400)
//                     .send({
//                         ErrorCode: "REQUEST",
//                         message: "Student Data not found",
//                     });
//             }
//             const CreateUserHistoryData = await db.UserHistory.create(
//                 UserIDWiseData.dataValues
//             );
//             if (!CreateUserHistoryData) {
//                 return res
//                     .status(400)
//                     .send({
//                         ErrorCode: "REQUEST",
//                         message: "Student Data Not insert in History Table",
//                     });
//             }
//             //-------------------------------------------------------------------//
//             await db.user.update(
//                 data,
//                 { where: { UserID: MessageBody.StudentID } }
//             );
//             return "Student updated successfully"
//         } catch (error) {
//             return "Failed to update student"
//         }
//     } catch (error) {
//         return "Sorry! there was server-side error"
//     }
// }

// const delete_student = async (req, res) => {
//     try {

//         const userExist = await db.user.findOne({
//             where: {
//                 UserID: MessageBody.StudentID,
//                 AccountType: 1
//             }
//         });
//         if (!userExist) {
//             return "Student not exits"
//         }

//         //---User history table-------------------------------------------//
//         const UserIDWiseData = await db.user.findOne({
//             where: { UserID: MessageBody.StudentID },
//         });

//         if (!UserIDWiseData) {
//             return res
//                 .status(400)
//                 .send({
//                     ErrorCode: "REQUEST",
//                     message: "Student Data not found",
//                 });
//         }
//         const CreateUserHistoryData = await db.UserHistory.create(
//             UserIDWiseData.dataValues
//         );
//         if (!CreateUserHistoryData) {
//             return res
//                 .status(400)
//                 .send({
//                     ErrorCode: "REQUEST",
//                     message: "Student Data Not insert in History Table",
//                 });
//         }
//         //-------------------------------------------------------------------//
//         try {
//             await db.user.update(
//                 {
//                     IsActive: 2
//                 },
//                 { where: { UserID: MessageBody.StudentID } }
//             );
//             return "Student deleted successfully"
//         } catch (error) {
//             return "Failed to delete student"
//         }
//     } catch (error) {
//         return "Sorry! there was server-side error"
//     }
// }

// HTTP REQUEST

const add_student_http = async (req, res, next) => {
    try {
        const result = req.body.student;

        // Decrypt the email
        let originalEmail;
        try {
            const bytesEmail = cryptoJS.AES.decrypt(result.Email, process.env.SECRET);
            originalEmail = bytesEmail.toString(cryptoJS.enc.Utf8);
        } catch (error) {
            return res.status(400).json({
                message: "Invalid encrypted email provided"
            });
        }

        // Check if decryption returned a valid string
        if (!originalEmail) {
            return res.status(400).json({
                message: "Email decryption failed or resulted in an empty string"
            });
        }

        // Check if the email already exists
        const emailExist = await db.useremail.findOne({
            where: { Email: originalEmail }
        });

        if (emailExist) {
            return res.status(401).json({
                message: "Email already exists"
            });
        }

        // Create a new user
        const newUser = await db.user.create({
            FirstName: result.FirstName,
            LastName: result.LastName,
            Email: result.Email,
            Password: result.Password,
            PhoneNumber: result.PhoneNumber,
            IsParticipateCompetitions: parseInt(result.IsParticipateCompetitions),
            IsLookFeedback: parseInt(result.IsLookFeedback),
            IsActive: 0,
            CreatedBy: 'Admin',
            LastModifiedBy: 'Admin',
            AccountType: 1,
            Grade: result.Grade,
            ParentID: result.ParentID,
        });

        // Add the email to the useremail table
        await db.useremail.create({
            UserID: newUser.UserID,
            Email: originalEmail
        });

        const dvToken = await db.visualnotification.findOne({
            where: { parentId: result.ParentID }
        });

        // Notification Body >>
        notificationBody.userId = newUser.UserID;
        notificationBody.notificationTitle = `Welcome ${result?.FirstName}, You are onboard!`;
        notificationBody.userEmailReq = originalEmail;
        notificationBody.emailType = 'student-created'
        notificationBody.deviceToken = dvToken?.deviceToken;
        notificationBody.concurrentBlock = 'signInParent';

        req.visualNotificationBody = notificationBody;
        // Notification Body <<

        next();  // Add Notifications to table

        return res.status(200).json({
            message: "Student added successfully",
            data: newUser
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was a server-side error",
            error: error
        });
    }
};
const get_student_by_id_http = async (req, res) => {
    try {

        const whereCondition = {};
        whereCondition.UserID = req.params.UserID;
        whereCondition.IsActive = { [Op.in]: ["0", "1"] };
        whereCondition.AccountType = 1;

        const userExist = await db.user.findOne({ where: whereCondition });

        if (userExist) {
            return res.status(200).json({
                message: "Profile Data",
                data: userExist
            })
        } else {
            return res.status(400).json({ Data: "Student Data Not Gets!" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was a server-side error",
            error: error
        });
    }
}

const update_student_http = async (req, res) => {
    try {
        const result = req.body.student;

        const userExist = await db.user.findOne({
            where: {
                UserID: req.params.UserID,
                AccountType: "1"
            }
        });
        if (!userExist) {
            return res.status(400).json({
                message: "Student Not Exist"
            })
        }
        else {
            var data = {
                FirstName: result.FirstName,
                LastName: result.LastName,
                Email: result.Email,
                Password: result.Password,
                PhoneNumber: result.PhoneNumber,
                IsParticipateCompetitions: parseInt(result.IsParticipateCompetitions),
                IsLookFeedback: parseInt(result.IsLookFeedback),
                IsActive: parseInt(result.IsActive),
                CreatedBy: 'Admin',
                LastModifiedBy: 'Admin',
                AccountType: 1,
                Grade: result.Grade,
                ParentID: result.ParentID,
            }
            console.log(data);

            //---User history table-------------------------------------------//
            const UserIDWiseData = await db.user.findOne({
                where: { UserID: req.params.UserID },
            });

            if (!UserIDWiseData) {
                return res
                    .status(400)
                    .send({
                        ErrorCode: "REQUEST",
                        message: "Student Data not found",
                    });
            }
            const CreateUserHistoryData = await db.UserHistory.create(
                UserIDWiseData.dataValues
            );
            if (!CreateUserHistoryData) {
                return res
                    .status(400)
                    .send({
                        ErrorCode: "REQUEST",
                        message: "Student Data Not insert in History Table",
                    });
            }
            //-------------------------------------------------------------------//
            await db.user.update(
                data,
                { where: { UserID: req.params.UserID } }
            );
            return res.status(200).json({
                message: "Student Updated successfully"
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! there was server-side error"
        })
    }
}


const delete_student_http = async (req, res) => {
    try {

        const userExist = await db.user.findOne({
            where: {
                UserID: req.params.UserID,
                AccountType: "1"
            }
        });
        if (!userExist) {
            return res.status(200).json({
                message: "Student not exits"
            })

        }

        //---User history table-------------------------------------------//
        const UserIDWiseData = await db.user.findOne({
            where: { UserID: req.params.UserID },
        });

        if (!UserIDWiseData) {
            return res
                .status(400)
                .send({
                    ErrorCode: "REQUEST",
                    message: "Student Data not found",
                });
        }
        const CreateUserHistoryData = await db.UserHistory.create(
            UserIDWiseData.dataValues
        );
        if (!CreateUserHistoryData) {
            return res
                .status(400)
                .send({
                    ErrorCode: "REQUEST",
                    message: "Student Data Not insert in History Table",
                });
        }
        //-------------------------------------------------------------------//
        try {
            await db.user.update(
                {
                    IsActive: "2"
                },
                { where: { UserID: req.params.UserID } }
            );
            await db.useremail.update(
                {
                    IsActive: '2'
                },
                { where: { UserID: req.params.UserID } }
            );
            return res.status(200).json({
                message: "Student deleted successfully"
            })

        } catch (error) {
            return res.status(200).json({
                message: "Failed to delete Student"
            })
        }
    } catch (error) {
        return res.status(200).json({
            message: "Sorry! there was server-side error"
        })
    }
}


const get_studentForParent_http = async (req, res) => {
    try {
        const ParentId = req.params.ParentID;
        const whereCondition = {};

        whereCondition.IsActive = { [Op.in]: ["0", "1"] };
        whereCondition.ParentID = ParentId;

        if (!ParentId) {
            return res.status(400).json({ message: "Missing ParentID in request parameters" });
        }

        const students = await db.user.findAll({
            where: whereCondition
        });


        if (students.length === 0) {
            return res.status(200).json({ message: "No students found for this parent" });
        }

        res.status(200).json({
            message: "Student Data",
            Data: students
        });
    } catch (error) {
        res.status(500).json({
            message: "Sorry! there was a server-side error",
            error: error.message
        });
    }
}

const get_reflections_http = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(process.env.HTTP_REQUEST_ADMIN + '/reflection/reflection/', {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.data) {
            res.status(500).json({
                message: "Reflection Not Found",
                Data: []
            })
        }
        res.status(200).json(response.data)
    } catch (error) {
        res.status(500).json({
            message: "Reflection Not Found",
        })
        console.log(error)
    }
}





module.exports = {
    // add_student,
    add_student_http,
    get_student_by_id_http,
    // update_student,
    update_student_http,
    // delete_student,
    delete_student_http,
    get_studentForParent_http,
    get_reflections_http,
}
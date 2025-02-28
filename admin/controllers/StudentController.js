const db = require("../models/index.js");
const Sequelize = require('sequelize');
const axios = require('axios');
const sqsValidator = require('../middleware/sq_request_send.js');
const { Op } = require("sequelize");
require('dotenv').config();

// const add_student = async (req, res) => {
//     try {
//         var MessageBody = {
//             type:'add_student',
//             data: req.body
//         }
//         await sqsValidator.clientlient(MessageBody);
//         return res.status(200).json({
//             message: "Student addedd successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }

// const update_student = async (req, res) => {
//     try {
//         var MessageBody = {
//             type:'update_student',
//             data: req.body
//         }
//         await sqsValidator.clientlient(MessageBody);
//         return res.status(200).json({
//             message: "Student updated successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }

// const delete_student = async (req, res) => {
//     try {
//         var MessageBody = {
//             type:'delete_student',
//             data: req.params
//         }
//         await sqsValidator.clientlient(MessageBody);
//         return res.status(200).json({
//             message: "Student deleted successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }



// async function getStudentForParent(req,res){
//     try {
//         const {ParentID} = req.params;
//         const url = process.env.HTTP_REQUEST_CLIENTLIENT;
//         const token = process.env.HTTP_REQUEST_SECRET_KEY;
//         const respParentData = await axios.get(`${url}/student/p/${ParentID}`,{
//             headers: { "Authorization": "Bearer " + token }
//         });
//         res.status(200).json({
//             message:"Student Data",
//             studentData:respParentData.data.Data
//         })
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message:"Error while fetching student data"
//         })
//     }
// }

// ADD STUDENT HTTP REQUEST
const add_student_http = async (req, res) => {
    try {
        const student = req.body;
        const response = await axios.post(
            process.env.HTTP_REQUEST_CLIENTLIENT + '/student/add', { student },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
                },
            }
        );
        return res.status(200).json({
            message: "Student Added successfully",
        })
    } catch (error) {
        if (error.response) {
            console.log(error.response);
            return res.status(error.response.status).json({
                message: error.response.data.message,
            })
        }
        else {
            console.log(error);
        }
    }
}


const get_student_http = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(process.env.HTTP_REQUEST_CLIENTLIENT + '/student/getStudentById/' + req.params.UserID, {
            headers: { "Authorization": "Bearer " + token }
        });
        res.status(200).json(response.data)
    } catch (error) {
        res.status(500).json({
            message: "Student Not Exsist",
        })
        console.log(error)
    }
}



const update_student_http = async (req, res) => {
    try {
        const student = req.body;
        const id = req.params.UserID;
        const response = await axios.put(
            process.env.HTTP_REQUEST_CLIENTLIENT + '/student/update/' + id, { student },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
                },
            }
        );
        return res.status(200).json({
            message: "Student Update successfully"
        })
    } catch (error) {
        if (error.response) {
            console.log(error.response);
            res.status(error.response.status).json({
                message: error.response.data.message
            })
        }
        else {
            console.log(error);
        }
    }
}


const delete_student_http = async (req, res) => {
    try {
        const student = req.body;
        const id = req.params.UserID;
        const response = await axios.delete(
            process.env.HTTP_REQUEST_CLIENTLIENT + '/student/delete/' + id,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
                },
            }
        );
        return res.status(200).json({
            message: "Student Delete successfully"
        })
    } catch (error) {
        if (error.response) {
            console.log(error.response);
            res.status(error.response.status).json({
                message: error.response.data.message
            })
        }
        else {
            console.log(error);
        }
    }
}

const get_StudentForParent_http = async (req, res) => {
    try {
        const student = req.body;
        const id = req.params.ParentID;
        const response = await axios.get(
            process.env.HTTP_REQUEST_CLIENTLIENT + '/student/getStudentForParent/' + id,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
                },
            }
        );
        if (!response.data) {
            return res.status(200).json({
                message: "Student Not Found",
            })
        }
        return res.status(200).json({
            data: response.data,
        })
    } catch (error) {
        if (error.response) {
            console.log(error.response);
            res.status(error.response.status).json({
                message: error.response.data.message
            })
        }
        else {
            console.log(error);
        }
    }

}

async function getOverallUsersCount(req, res) {
  try {
    const { searchQuery } = req.query;
    let userCount = 0;
    let studentCount = 0;

    if(!searchQuery){
        const overallProfile = await db.admin.findAndCountAll({
            where:{IsActive: { [Op.in]: ["0","1"] }}
        });

        userCount = overallProfile.count;
    }

    if(searchQuery){
        const intQuery = parseInt(searchQuery);
        const overallProfile = await db.admin.findAndCountAll({
            where:{AccountType: intQuery, IsActive: { [Op.in]: ["0","1"] }}
        });

        userCount = overallProfile.count;
    }

    const urlClient = process.env.HTTP_REQUEST_CLIENTLIENT;
    const token = process.env.HTTP_REQUEST_SECRET_KEY;

    const respUser = await axios.get(`${urlClient}/student/s/studentOverAllCount?searchQuery=${searchQuery}`,{
        headers : {'Authorization': `Bearer ${token}`}
    })


    if(respUser.data){
        userCount = userCount + respUser.data.overAllUserCount;
        studentCount = respUser.data.overAllStudent ? respUser.data.overAllStudent : 0;
    };

    return res.status(200).json({
        overallUser:userCount,
        overallStudent:studentCount
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

module.exports = {
    // add_student,
    // update_student,
    // get_student,
    // delete_student,
    // getStudentForParent
    get_StudentForParent_http,
    add_student_http,
    get_student_http,
    update_student_http,
    delete_student_http,
    getOverallUsersCount
};

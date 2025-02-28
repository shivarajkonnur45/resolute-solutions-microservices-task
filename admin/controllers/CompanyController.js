const db = require("../models/index.js");
const Sequelize = require('sequelize');
const axios = require('axios');
const sqsValidator = require('../middleware/sq_request_send.js');

// const add_company = async (req, res) => {
//     try {
//         var MessageBody = {
//             type: 'add_company',
//             data: req.body
//         }
//         console.log(req.body);
//         const sqsCheck = await sqsValidator.clientlient(MessageBody);
//         console.log(`-----------------`);
//         console.log(sqsCheck);
//         console.log(`-----------------`);
//         return res.status(200).json({
//             message: "Company addedd successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }


// const update_company = async (req, res) => {
//     try {
//         var MessageBody = {
//             type: 'update_company',
//             data: req.body
//         }
//         await sqsValidator.clientlient(MessageBody);
//         return res.status(200).json({
//             message: "Company updated successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }

// const delete_company = async (req, res) => {
//     try {
//         var MessageBody = {
//             type: 'delete_company',
//             data: req.params
//         }
//         await sqsValidator.clientlient(MessageBody);
//         return res.status(200).json({
//             message: "Company deleted successfully"
//         })
//     } catch (error) {
//         return res.status(400).send({
//             message: error.message
//         });
//     }
// }




// COMPANY HTTP REQUEST
const add_company_http = async (req, res) => {
    try {
        const { AccDetails } = req;
        if (!AccDetails || !AccDetails.UserID) {
            return res.status(400).json({
                message: "Invalid Token! Login again"
            })
        }

        const company = req.body;

        const response = await axios.post(
            process.env.HTTP_REQUEST_CLIENTLIENT + `/company/add`, { company },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
                },
            }
        );

        return res.status(response.status).json({
            message: "Company Added successfully"
        })
    } catch (error) {
        if (error.response) {
            console.log(error.response);
            res.status(error.response.status).json({
                message: error.response.data.message
            })
        }
    }
}

const get_company_http = async (req, res) => {
    try {
        const { UserID } = req.query;
        const page = req.query.page ? req.query.page : 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const response = await axios.get(process.env.HTTP_REQUEST_CLIENTLIENT + `/company/getCompanyById?UserID=${UserID}&limit=${limit}&offset=${offset}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        if (!response.data) {
            return res.status(404).json({
                message: "Company not found"
            })
        }

        return res.status(200).json(response.data)
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Company Not Exsist",
            error: error.message
        })
    }
}

const update_company_http = async (req, res) => {
    try {
        const company = req.body;
        const id = req.params.UserID;
        const response = await axios.put(
            process.env.HTTP_REQUEST_CLIENTLIENT + '/company/update/' + id, { company },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
                },
            }
        );
        return res.status(200).json({
            message: "Company Update successfully"
        })
    } catch (error) {
        console.log(error);
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

const delete_company_http = async (req, res) => {
    try {
        const company = req.body;
        const id = req.params.UserID;
        const response = await axios.delete(
            process.env.HTTP_REQUEST_CLIENTLIENT + '/company/delete/' + id,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
                },
            }
        );
        return res.status(200).json({
            message: "Company Delete successfully"
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

module.exports = {
    // add_company,
    // update_company,
    // delete_company,
    get_company_http,
    add_company_http,
    update_company_http,
    delete_company_http,
};
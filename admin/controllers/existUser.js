const { staffAdmin } = require('../models/index');
const cryptoJS = require('crypto-js');
const axios = require('axios');
const { Op } = require('sequelize');

async function checkAdminEmail(req, res) {
    try {
        const { Email, userID } = req.body;
        if (!Email) {
            return res.status(403).json({
                message: "Email Not Found",
                statusCode: 1
            })
        }
        else {
            if (userID == 0 || !userID) {
                const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
                const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
                // console.log(originalEmail);
                if (originalEmail) {
                    const alreadyExistEmail = await staffAdmin.findOne({ where: { staffEmail: originalEmail, IsActive: { [Op.eq]: "1" } } });
                    if (alreadyExistEmail) {
                        return res.status(403).json({
                            message: "Already Existing Email",
                            statusCode: 1
                        })
                    }
                    else {
                        return res.status(200).json({
                            message: "You are good to go!",
                            statusCode: 0
                        })
                    }
                }
                else {
                    return res.status(200).json({
                        message: "You are good to go!",
                        statusCode: 0
                    })
                }
            }
            else {
                // console.log(`object`);
                const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
                const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
                // console.log(originalEmail)
                const userTypeId = parseInt(userID);
                // console.log(userTypeId);
                const userEditFound = await staffAdmin.findOne({ where: { StaffID: userTypeId } });
                // console.log(userEditFound);
                const existCheck = await staffAdmin.findOne({ where: { staffEmail: originalEmail } });
                // console.log(existCheck);
                if (!existCheck) {
                    return res.status(200).json({
                        message: "You are good to go!",
                        statusCode: 0
                    })
                }
                else {
                    if (userEditFound.StaffID != existCheck.StaffID) {
                        return res.status(403).json({
                            message: "Already Existing Email",
                            statusCode: 1
                        })
                    }
                    else {
                        return res.status(200).json({
                            message: "You are good to go!",
                            statusCode: 0
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error while validating Email/Password"
        })
    }
}

async function checkUserEmail(req, res) {
    try {
        // console.log(`object`);
        const { Email, userID } = req.body;

        // console.log(Email);
        if (!Email) {
            return res.status(403).json({
                message: "Email Not Found",
                statusCode: 1
            })
        }
        else {
            const url = process.env.HTTP_REQUEST_CLIENTLIENT;
            const token = process.env.HTTP_REQUEST_SECRET_KEY;
            // console.log(token);
            const resp = await axios.get(`${url}/emailUserCheck?Email=${Email}&userID=${userID}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            // console.log(resp.data);
            if (resp.data) {
                console.log(resp.data);
                return res.status(200).json({
                    message: resp.data.message,
                    statusCode: 0
                })
            }
        }
    } catch (error) {
        // console.log(error);
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response)
            return res.status(error.response.status).json({
                message: error.response.data.message,
                statusCode: 1
            })
        }
        else {
            console.log(error);
            return res.status(500).json({
                message: "Something went wrong!"
            })
        }
    }
}

async function checkForAdminMailFromAdminSide(req, res, next) {
    try {
        const { Email } = req.body;
        if (!Email) {
            return res.status(404).json({
                message: "Email Not Found"
            })
        }
        else {
            const emailExist = await staffAdmin.findOne({ where: { staffEmail: Email } });
            if (emailExist) {
                return res.status(401).json({
                    message: "This Email Already Exist! Try new one"
                })
            }
            else {
                next();
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! there was an server-side error"
        })
    }
}

async function checkAdminEmailHttp(req, res) {
    try {
        const { userEmail } = req.query;
        if (!userEmail) {
            return res.status(400).json({
                message: "Email Not Found"
            })
        }

        const alreadyExistEmail = await staffAdmin.findOne({ where: { staffEmail: userEmail } });
        if (alreadyExistEmail) {
            return res.status(200).json({
                foundCode: 1
            })
        }
        return res.status(200).json({
            foundCode: 0
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! there was an server-side error"
        })
    }
}
module.exports = { checkAdminEmail, checkUserEmail, checkForAdminMailFromAdminSide, checkAdminEmailHttp };
const { admin } = require('../models/index');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js');
const { Op } = require('sequelize');
require('dotenv').config();

async function userLogin(req, res) {
    try {
        const { PK } = req;
        const { Password } = req.body;
        if (!Password) {
            res.status(401).json({
                message: "All Fields are necessary"
            })
        }
        else {
            if (!PK) {
                res.status(404).json({
                    message: "User doesnot exist"
                })
            }
            else {
                const userExists = await admin.findOne({ where: { UserID: PK, isActive: { [Op.ne]: "2" } } });
                if (!userExists) {
                    res.status(404).json({
                        message: "User does not exist"
                    })
                }
                else {
                    const bytesPassword = await cryptoJS.AES.decrypt(Password, process.env.SECRET);
                    const frontPassword = await bytesPassword.toString(cryptoJS.enc.Utf8);
                    const backPass = await cryptoJS.AES.decrypt(userExists.Password, process.env.SECRET);
                    const usePass = await backPass.toString(cryptoJS.enc.Utf8);
                    // console.log(userExists.dataValues);
                    if (frontPassword === usePass) {
                        try {
                            const token = await jwt.sign({ accountDetail: userExists }, process.env.JWT_SECRET);
                            userExists.Password = undefined;
                            res.status(200).json({
                                message: "Logged In",
                                userToken: token,
                                Data: userExists
                            })
                        } catch (error) {
                            res.status(501).json({
                                message: "Error while creating token"
                            })
                        }
                    }
                    else {
                        res.status(401).json({
                            message: "Invalid Password"
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

module.exports = userLogin;
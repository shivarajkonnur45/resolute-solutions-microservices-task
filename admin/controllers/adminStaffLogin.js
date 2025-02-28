const { admin } = require('../models/index');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js');
const { Op } = require("sequelize");
require('dotenv').config();

async function adminStaffLogin(req, res) {
    try {
        const { Password } = req.body;
        if (!Password) {
            res.status(404).json({
                message: "All Fields are neccessary"
            })
        }
        else {
            const { PK } = req;
            if (!PK) {
                res.status(501).json({
                    message: "Sorry! There was an error while fetching your email"
                })
            }
            else {
                const userPassExist = await admin.findOne({ where: { UserID: PK, isActive: { [Op.ne]: "2" } } });
                if (!userPassExist) {
                    res.status(404).json({
                        message: "User not found"
                    })
                }
                else {
                    // console.log(userPassExist);
                    const bytesPassword = await cryptoJS.AES.decrypt(Password, process.env.SECRET);
                    const frontPassword = await bytesPassword.toString(cryptoJS.enc.Utf8);
                    const backPass = await cryptoJS.AES.decrypt(userPassExist.Password, process.env.SECRET);
                    const usePass = await backPass.toString(cryptoJS.enc.Utf8);
                    if (usePass === frontPassword) {
                        try {
                            const token = await jwt.sign({ accountDetail: userPassExist, token: userPassExist }, process.env.JWT_SECRET);
                            userPassExist.Password = undefined;
                            res.status(200).json({
                                message: "Logged In",
                                userToken: token,
                                Data: userPassExist
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
            // async function checkEquailty(dbEmail, FrontEmail) {
            //     try {
            //         const bytesEmail = await cryptoJS.AES.decrypt(FrontEmail, process.env.SECRET);
            //         const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
            //         const backEmail = await cryptoJS.AES.decrypt(dbEmail, process.env.SECRET);
            //         const backEmailText = await backEmail.toString(cryptoJS.enc.Utf8);
            //         if (originalEmail === backEmailText) {
            //             // return { email: backEmailText }
            //             console.log(originalEmail);
            //             console.log(backEmailText);
            //             // const decryptPass = await cryptoJS.AES.decrypt(Password, process.env.SECRET);
            //             try {
            //                 const existEmail = await admin.findOne({
            //                     where: { Email: dbEmail }
            //                 });
            //                 if (existEmail) {
            //                     const checkPass = await cryptoJS.AES.decrypt(existEmail.Password, process.env.SECRET);
            //                     const originalPass = await checkPass.toString(cryptoJS.enc.Utf8);
            //                     const userEnterdPass = await cryptoJS.AES.decrypt(Password, process.env.SECRET);
            //                     const userOrignalPass = await userEnterdPass.toString(cryptoJS.enc.Utf8);
            //                     console.log(originalPass);
            //                     console.log(userOrignalPass);
            //                     if (originalPass === userOrignalPass) {
            //                         console.log(existEmail.AccountType);
            //                         const token = await jwt.sign({ accountType: existEmail.AccountType }, process.env.SECRET);
            //                         return res.status(200).json({
            //                             message: "Logged In Successfully",
            //                             userToken: token
            //                         })
            //                     }
            //                     else {
            //                         return res.status(401).json({
            //                             message: "Invalid Password"
            //                         })
            //                     }
            //                 }
            //                 else {
            //                     res.status(401).json({
            //                         message: "Unauthorised Email"
            //                     })
            //                 }

            //             } catch (error) {
            //                 console.log(error);
            //             }
            //         }
            //         else{
            //             count = count + 1;
            //         }
            //         // return res.status(404).json({
            //         //     message:"Email Not Found"
            //         // })

            //     } catch (error) {
            //         console.log(error);
            //     }
            // }
            // const allEncEmail = await admin.findAll();
            // if (allEncEmail.length > 0) {
            //     await allEncEmail.forEach((singleEmail) => {
            //         checkEquailty(singleEmail.Email, Email);
            //     })
            //     if(count === allEncEmail.length){
            //         return res.status(404).json({
            //             message:"Email Not Found"
            //         })
            //     }
            // }



            // console.log(foundEmail);
            // console.log(found);
            // const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
            // const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
            // const existEmail = await admin.findOne({
            //     where: {
            //         Email: originalEmail
            //     }
            // })
            // if (!existEmail) {
            //     res.status(404).json({
            //         message: "EMAIL NOT FOUND"
            //     })
            // }
            // else {
            //     const bytesPassword = await cryptoJS.AES.decrypt(Password, process.env.SECRET);
            //     const originalPassword = await bytesPassword.toString(cryptoJS.enc.Utf8);

            // }
            // if (!existEmail) {
            //     res.status(404).json({
            //         message: "Email not found"
            //     })
            // }
            // else {
            // const encryptEmail = await cryptoJS.AES.encrypt(Email, process.env.SECRET).toString();
            // console.log(encryptEmail);
            // const encryptPassword = await cryptoJS.AES.encrypt(Password, process.env.SECRET).toString();

            // console.log(originalText);
            // res.status(200).json({
            //     message: "done"
            // })
            //}
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! there was server-side error"
        })
    }
}

module.exports = adminStaffLogin;
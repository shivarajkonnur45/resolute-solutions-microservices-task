const db = require('../models/index');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();
const client = new OAuth2Client(process.env.CLIENT_ID);

async function checkPasswordExistOrNot(req, res) {
    try {
        const { userEmail } = req.query;
        if (!userEmail) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        else {
            const userForPass = await db.useremail.findOne({ where: { Email: userEmail } });
            if (userForPass) {
                const userData = await db.user.findByPk(userForPass.UserID);
                if (userData) {
                    const userPassExist = await userData.Password.split('-')[0];
                    if (userPassExist == 'EmailLogin') {
                        return res.status(200).json({
                            isEmailLogged: 1
                        })
                    }
                    if (userPassExist == 'GoogleLogin') {
                        return res.status(200).json({
                            isEmailLogged: 2
                        })
                    }
                    else {
                        return res.status(200).json({
                            isEmailLogged: 0
                        })
                    }
                }
            }
            return res.status(404).json({
                message: "User not found"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

async function signInWithOtpParent(req, res, next) {
    try {
        const { userEmail } = req.query;
        if (!userEmail) {
            return res.status(401).json({
                message: "Invalid Parameters"
            })
        }
        else {
            const userEmailExist = await db.useremail.findOne({ where: { Email: userEmail } });
            if (userEmailExist) {
                const userExist = await db.user.findByPk(userEmailExist.UserID);
                if (userExist) {
                    const isEmailLogged = await userExist.Password.split('-')[0];
                    if (isEmailLogged == 'EmailLogin') {
                        req.fromSignIn = true;
                        next();
                    }
                    else {
                        return res.status(500).json({
                            message: "You have logged in with other method!"
                        })
                    }
                }
                else {
                    return res.status(500).json({
                        message: "Email Not Found"
                    })
                }
            }
            else {
                return res.status(500).json({
                    message: "Email Not Found"
                })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

async function checksignINParentOTP(req, res) {
    try {
        const { userEmail, Otp } = req.query;
        if (!userEmail || !Otp) {
            return res.status(400).json({
                message: "Invalid Parameters"
            })
        }
        else {
            const dbOtp = await db.OTP.findOne({ where: { Email: userEmail, otpUser: Otp, isNotUsed: 1 } });
            const userExist = await db.useremail.findOne({ where: { Email: userEmail } });
            if (dbOtp && userExist) {
                const firstName = await userEmail.split('@')[0];
                const tokenJwt = await jwt.sign({
                    accountDetail: userExist
                }, process.env.JWT_SECRET);
                return res.status(200).json({
                    message: "Logged in Successfully",
                    FirstName: firstName,
                    LastName: firstName,
                    AccountType: 3,
                    token: tokenJwt
                })
            }
            else {
                return res.status(400).json({
                    message: "Invalid OTP or User Do not Exist"
                })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

async function signInWithGoogleParent(req, res) {
    try {
        if (!req.headers.authorization) {
            return res.status(404).json({
                message: "token not found"
            })
        }
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(404).json({
                message: "Oops! There was an error while authentication! Login Again"
            })
        }
        else {
            try {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: process.env.CLIENT_ID
                });
                if (!ticket) {
                    return res.status(401).json({
                        message: "There was an error with validation"
                    })
                }
                else {
                    const output = ticket.getPayload();
                    const userEmail = output.email;
                    const userExist = await db.useremail.findOne({ where: { Email: userEmail } });
                    if (!userExist) {
                        return res.status(404).json({
                            message: "User not found sign up to continue"
                        })
                    }
                    else {
                        const userData = await db.user.findByPk(userExist.UserID);
                        if (!userData) {
                            return res.status(404).json({
                                message: "User not found sign up to continue"
                            })
                        }
                        else {
                            const bytesEmail = await cryptoJS.AES.decrypt(userData.Email, process.env.SECRET);
                            const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
                            if (originalEmail == userEmail) {
                                const tokenJwt = await jwt.sign({ accountDetail: userData }, process.env.JWT_SECRET);
                                return res.status(200).json({
                                    message: "Logged in successfully",
                                    FirstName: userData.FirstName,
                                    LastName: userData.LastName ? userData.LastName : userData.FirstName,
                                    AccountType: 3,
                                    token: tokenJwt
                                });
                            }
                            else {
                                return res.status(404).json({
                                    message: "Email Did not matched or you do not have permission for this sign in Method!"
                                })
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(error);
                return res.status(500).json({
                    message: "Invalid token! This may happen due to invalid syntax or expired token"
                })
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

async function signInWithFacebookParent(req, res) {
    try {
        const { userEmail } = req.query;
        const userExist = await db.useremail.findOne({ where: { Email: userEmail } });
        if (!userExist) {
            return res.status(404).json({
                message: "User not found sign up to continue"
            })
        }
        const userData = await db.user.findByPk(userExist.UserID);
        if (!userData) {
            return res.status(404).json({
                message: "User not found sign up to continue"
            })
        }

        const bytesEmail = await cryptoJS.AES.decrypt(userData.Email, process.env.SECRET);
        const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
        if (originalEmail == userEmail) {
            const tokenJwt = await jwt.sign({ accountDetail: userData }, process.env.JWT_SECRET);
            return res.status(200).json({
                message: "Logged in successfully",
                FirstName: userData.FirstName,
                LastName: userData.LastName ? userData.LastName : userData.FirstName,
                AccountType: 3,
                token: tokenJwt
            });
        }
        else {
            return res.status(404).json({
                message: "Email Did not matched or you do not have permission for this sign in Method!"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

module.exports = { checkPasswordExistOrNot, signInWithOtpParent, checksignINParentOTP, signInWithGoogleParent, signInWithFacebookParent };
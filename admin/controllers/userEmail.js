const { userEmail } = require('../models/index');
const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');

async function saveUserEmail(req, res, next){
    try {
        const {Email} = req.body;
        if(!Email){
            res.status(401).json({
                message:"All Fields are neccessary"
            })
        }
        else{
            const bytesEmail = await cryptoJS.AES.decrypt(Email, process.env.SECRET);
            const originalEmail = await bytesEmail.toString(cryptoJS.enc.Utf8);
            const userExist = await userEmail.findOne({
                where:{
                    emailUser:originalEmail
                }
            });
            if(!userExist){
                res.status(404).json({
                    message:"User Not-Found"
                })
            }
            else{
                req.PK = userExist.UserID;
                next();
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Sorry! There was an server-side error"
        })
    }
}

module.exports = saveUserEmail;
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function checKValidity(req, res, next) {
    try {
        // console.log(req.headers);
        if (!req.headers.authorization) {
            res.status(404).json({
                message: "token not found"
            })
        }
        else {
            const token = req.headers.authorization.split(" ")[1];
            // console.log(token);
            if (!token) {
                res.status(404).json({
                    message: "Oops! There was an error while authentication! Login Again"
                })
            }
            else {
                try {
                    const verified = await jwt.verify(token, process.env.JWT_SECRET);
                    // console.log(verified);
                    if (!verified) {
                        res.status(404).json({
                            message: "Invalid token! Login Again"
                        })
                    }
                    else {
                        const isArrayValidate = Array.isArray(verified.accountDetail);
                        if (isArrayValidate == true) {
                            req.AccDetails = verified.accountDetail[0];
                            next();
                        }
                        if (isArrayValidate == false) {
                            req.AccDetails = verified.accountDetail;
                            next();
                        }
                    }
                } catch (error) {
                    // console.log(error);
                    res.status(501).json({
                        message: "Invalid token! Login Again"
                    })
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

module.exports = checKValidity;
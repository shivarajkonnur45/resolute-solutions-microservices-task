const jwt = require('jsonwebtoken');
require('dotenv').config();

async function fileValidity(req, res, next) {
    try {
        // console.log(req.headers);
        if (!req.headers.authorization) {
            return res.status(404).json({
                message: "token not found"
            })
        }
        else {
            const token = req.headers.authorization.split(" ")[1];
            // console.log(token);
            if (!token) {
                return res.status(404).json({
                    message: "Oops! There was an error while authentication! Login Again"
                })
            }
            else {
                try {
                    const verified = jwt.verify(token, process.env.JWT_SECRET);
                    // console.log(verified);
                    if (!verified) {
                        return res.status(404).json({
                            message: "Invalid token! Login Again"
                        })
                    }
                    else {
                        next();
                    }
                } catch (error) {
                    // console.log(error);
                    return res.status(501).json({
                        message: "Invalid token! Login Again"
                    })
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

module.exports = fileValidity;
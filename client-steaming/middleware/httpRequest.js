require('dotenv').config();

async function httpRequest(req,res,next){
    try {
        const httpSecret = process.env.HTTP_REQUEST_SECRET_KEY;
        if (!req.headers.authorization) {
            res.status(404).json({
                message: "HTTP SECRET NOT FOUND"
            })
        }
        else{
            const token = req.headers.authorization.split(" ")[1];
            // console.log(token);
            if (!token) {
                res.status(404).json({
                    message: "HTTP SECRET IS NECCESSARY"
                })
            }
            else{
                if(httpSecret === token){
                    next()
                }
                else{
                    res.status(403).json({
                        message:"THIS IS A PROTECTED ROUTE"
                    })
                }
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"BYPASS ERROR - HTTP REQUEST"
        })
    }
}

module.exports = httpRequest;
require('dotenv').config();

async function checkVideoAuth(req, res, next) {
    try {
        const { token } = req.query;
        
        if (!token) {
            return res.status(404).json({
                message: "You need to authenticate yourself"
            })
        }

        const videoToken = process.env.VIDEO_ROUTE_AUTH;

        if (videoToken != token) {
            return res.status(400).json({
                message: "You are not allowed to access this route!"
            })
        }
        else {
            next();
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "You are not allowed to access this route!"
        })
    }
}

module.exports = checkVideoAuth;
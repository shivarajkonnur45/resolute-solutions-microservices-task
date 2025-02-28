const cacheMemory = require('../cache/subscription');
const axios = require('axios');
require('dotenv').config();

async function checkUserSubscription(req, res, next) {
    try {
        const { parentId, studentId } = req.query;
        if (!parentId, !studentId) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        // fetch the key (user id) from hash map
        const isValidForSub = await cacheMemory.get(studentId);

        // is data not present in hash map make an http database call in client lient
        if (!isValidForSub) {
            const clientUrl = process.env.HTTP_REQUEST_CLIENTLIENT;
            const token = process.env.HTTP_REQUEST_SECRET_KEY;

            const subStats = await axios.get(`${clientUrl}/subscription/httpSubStatus?parentId=${parentId}&studentId=${studentId}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if(!subStats.data){
                return res.status(400).json({
                    message:"Internal server error"
                })
            }

            if(subStats.data.subStat == 1){
                cacheMemory.set(studentId, subStats.data.subStat);
            }
        }

        const isValidRecheck = await cacheMemory.get(studentId);

        if(!isValidRecheck){
            return res.status(401).json({
                message:"You do not have any valid active plans!"
            })
        }

        next();

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Invalid Subscription"
        })
    }
}

module.exports = checkUserSubscription;
const db = require('../models/index');

async function validateWatchTime(req, res, next) {
    try {
        const { AccDetails } = req;
        // console.log(AccDetails[0].UserID);
        if (!AccDetails) {
            return res.status(401).json({
                message: "Invalid Token"
            })
        }
        else {
            const { watchTime, videoUrl } = req.query;
            if (!watchTime || !videoUrl) {
                return res.status(500).json({
                    message: "Something went wrong"
                })
            }
            else {
                const alreadyWatched = await db.CourseVideo.findOne({ where: { UserID: AccDetails.UserID, VideoName: videoUrl } });
                
                if (!alreadyWatched) {
                    next();
                }
                else {
                    const numHighestBuffer = parseInt(alreadyWatched.HightestBufferTime);
                    const numWatchTime = parseInt(watchTime);
                    if (numHighestBuffer < numWatchTime && (numWatchTime - numHighestBuffer) <= 20) { // Checks whether user has skipped video or not
                        next();
                    }
                    else {
                        await db.CourseVideo.update({ LatestBufferTime: watchTime }, { where: { CourseVideoID: alreadyWatched.CourseVideoID } });
                        return res.status(200).json({
                            message:"New Time Updated"
                        })
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}

module.exports = validateWatchTime;
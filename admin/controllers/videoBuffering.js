const fs = require("fs");
const path = require("path");
const { getVideoDurationInSeconds } = require('get-video-duration');

async function videoPlay(req, res) {
    try {
        const { Vurl, vState } = req.query;
        if (!Vurl) {
            return res.status(404).json({
                message: "Invalid Video Url"
            })
        }
        else {
            const uploadDir = path.join(__dirname, '..', '/volume/Video/');
            // if (vState == 'true') {
                let range = req.headers.range;
        
                if (!range) {
                    range = 'bytes=0-';
                }
               
                const videoPath = uploadDir + Vurl;
                const videoSize = fs.statSync(videoPath).size;

                const CHUNK_SIZE = 10 ** 6; // 1 Mb  = 10 ^ 6 Bytes
                const rangeArr = range.split("-");
                
                let start = Number(rangeArr[0].replace("bytes=", ""));
             
                if(start === 1){
                    start = 0;
                }
               
                const end = rangeArr[1] && Number(rangeArr[1]) === 1 ? 1 : Math.min(start + CHUNK_SIZE, videoSize - 1);
                
                const contentLength = end - start + 1;
                
                const headers = {
                    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": contentLength,
                    "Content-Type": "video/mp4"
                };
                
                res.writeHead(206, headers);
                const videoStream = fs.createReadStream(videoPath, { start, end });
                videoStream.pipe(res);
            //}
            // if (vState == 'false') {
            //     console.log(`Video Paused`);
            //     res.end();
            // }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while playing video"
        })
    }
}

//! Get Video Size for User Side ---Starts--->>

async function getVideoLengthForUser(req, res) {
    try {
        const { videoUrl } = req.query;
        if (!videoUrl) {
            return res.status(401).json({
                message: "Invalid File"
            })
        }
        else {
            try {
                let getDir = path.join(__dirname, '..', '/volume/Video/');
                const videoLength = await getVideoDurationInSeconds(getDir + videoUrl);
                return res.status(200).json({
                    videoLength: videoLength
                })
            } catch (error) {
                res.status(500).json({
                    message: "Error while fetching Video Size. This might occur due to invalid url or corrupt video file"
                })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Invalid File Size"
        })
    }
}
//! Get Video Size for User Side ---Ends--->>


module.exports = { videoPlay, getVideoLengthForUser };
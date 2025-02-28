const ffmpeg = require("fluent-ffmpeg");

function asyncFfmpegHandler(videoUrl) {
  return new Promise((resolve, reject) => {

    const command = ffmpeg();

    command.input(videoUrl).ffprobe((error, metadata) => {
      if (error) {
        console.log(error);
        return reject(new Error(error));
      }
      const roundDuration = Math.round(metadata.format.duration);
      return resolve(roundDuration);
    });
  });
}

module.exports = asyncFfmpegHandler;

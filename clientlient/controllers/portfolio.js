const db = require("../models/index");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const {
  videoSupported,
  docSupported,
  pdfSupported,
  imgSupported,
  audioSupported,
} = require("../Data/supportedFiles");
require("dotenv").config();
const createZip = require("../helper/ArcheiveFiles");

var ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath("/usr/bin/ffmpeg");

// Portfolio Add {but isActive = 0}
async function addPortfolio(req, res) {
  try {
    const { AccDetails } = req;
    const { Pt } = req;
    const { portfolioMainId } = req.body;

    if (!AccDetails || !Pt || !portfolioMainId) {
      return res.status(401).json({
        message: "Something went wrong",
      });
    }

    const { LessonId, CourseId, ModuleId } = req.query;
    // const fileName = Pt.split(".");
    // const fileExt = fileName[fileName.length - 1];

    if (!LessonId || !CourseId || !ModuleId) {
      return res.status(404).json({
        message: "Invalid Lesson",
      });
    }

    const studentId = AccDetails.UserID;
    const createdBy = AccDetails.FirstName + " " + AccDetails?.LastName;
    const { Description } = req.body;

    const portfolioCreated = await db.portfolio.create({
      StudentID: studentId,
      Description: Description,
      CreatedBy: createdBy,
      CourseID: CourseId,
      ModuleID: ModuleId,
      LessonID: LessonId,
      portFolioLessonId: portfolioMainId,
    });

    // Checking Portfolio is multiple or not
    const validatePortfolio = Array.isArray(Pt);

    if (validatePortfolio == false) {
      await db.portfoliofile.create({
        StudentID: studentId,
        PortfolioID: portfolioCreated.PortfolioID,
        Filename: Pt,
      });
    }

    if (validatePortfolio == true) {
      const portFiles = Pt.map((single) => {
        return {
          StudentID: studentId,
          PortfolioID: portfolioCreated.PortfolioID,
          Filename: single,
        };
      });

      await db.portfoliofile.bulkCreate(portFiles);
    }

    const options = {
      createdBy: createdBy,
      portfolioId: portfolioCreated.PortfolioID,
      LessonId,
      CourseId,
      ModuleId
    };

    validatePortfolios(options); // Calling Webhook <<<<<<

    return res.status(200).json({
      message: "Your Portfolio has been received wait until we process it.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

// Portfolio Image Upload
async function uploadPortfolio(req, res, next) {
  try {
    let Pt = [];
    if (!req.files || !req.files.Portfolio) {
      const { prevPort } = req.body;

      if (!prevPort) {
        return res.status(400).json({
          message: "Previous portfolio not found",
        });
      }
      const parsedPort = JSON.parse(prevPort);

      for (let i = 0; i < parsedPort.length; i++) {
        const isPortPresent = path.join(
          __dirname,
          "..",
          `/volume/portfolio/${parsedPort[i]}`
        );
        const isExist = fs.existsSync(isPortPresent);
        if (!isExist) {
          return res.status(404).json({
            message: "One of the file not found",
          });
        }
      }

      Pt = [...parsedPort];
    }
    if (req.files) {
      if (req.files.Portfolio) {
        const portfolioFile = req.files.Portfolio;
        const isArrayValidate = Array.isArray(portfolioFile);

        if (isArrayValidate == false) {
          const uploadDir = path.join(__dirname, "..", "/volume/portfolio/");
          Pt.push(portfolioFile.name);
          req.Pt = Pt; // Pt -> Portfolio data
          await portfolioFile.mv(uploadDir + portfolioFile.name);
        }

        if (isArrayValidate == true) {
          const uploadDir = path.join(__dirname, "..", "/volume/portfolio/");
          for (let i = 0; i < portfolioFile.length; i++) {
            Pt.push(portfolioFile[i].name);
            req.Pt = Pt; // Pt -> Portfolio data
            await portfolioFile[i].mv(uploadDir + portfolioFile[i].name);
          }
        }
      }
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an while uploading Portfolio",
    });
  }
}

// Get Portfolio function
async function getPortfolioUser(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid Token! Login Again",
      });
    }

    const allPortfolioDataForUser = await db.portfolio.findAll({
      where: { StudentID: AccDetails.UserID },
      include: [db.portfoliofile],
    });

    return res.status(200).json({
      message: "User Portfolio Data",
      portfolio: allPortfolioDataForUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server side error",
    });
  }
}

//Portfolios files
async function getPortfolioFiles(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid Token! Login Again",
      });
    }

    const { portfolioId } = req.query;
    if (!portfolioId) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    const portfolioData = await db.portfolio.findByPk(portfolioId);

    if (!portfolioData || !portfolioData.CourseID) {
      return res.status(404).json({
        message: "Portfolio not found",
      });
    }

    const portfolioFileData = await db.portfoliofile.findAll({
      where: { PortfolioID: portfolioId },
    });

    const adminUrl = process.env.HTTP_REQUEST_ADMIN;
    const token = process.env.HTTP_REQUEST_SECRET_KEY;

    const courseTitle = await axios.get(
      `${adminUrl}/courseTrophyTitle?CourseId=${portfolioData.CourseID}`,
      {
        headers: { Authorization: "Bearer " + token },
      }
    );

    return res.status(200).json({
      courseTitle: courseTitle?.data?.courseTitle,
      lessonDesc: courseTitle?.data?.lessonDesc,
      portfolioData: portfolioData,
      portfolioFileData: portfolioFileData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server side error",
    });
  }
}

//Python code to validate The Portfolio Submitted by user

async function validatePortfolios(options) {
  // Python Portfolio Validation api call
  try {
    const { portfolioId, createdBy, LessonId, CourseId, ModuleId } = options;
    let LessonUrl = undefined;
    let TranscriptUrl = "";

    function consoleError(message) {
      console.log(message);
      return message;
    }

    if (!portfolioId || !createdBy) {
      console.log(`Invalid Argument -> Please Add check fields ${options}`);
      return consoleError("Error Encountered");
    }

    // if (!LessonUrl && !TranscriptUrl) {
    //   console.log(`Either of the url not found!`);
    //   return consoleError("`Either of the url not found!");
    // }
    const allPortFolioFiles = await db.portfoliofile.findAll({
      where: { PortfolioID: portfolioId },
    });

    if (!allPortFolioFiles && allPortFolioFiles.length == 0) {
      return consoleError("No data present! No need to go forward!");
    }

    for (let i = 0; i < allPortFolioFiles.length; i++) {
      let videoDetectionUrl = `${process.env.VIDEO_DETECTION_URL}?createdBy=${createdBy}&portfolioId=${portfolioId}`;
      let portfolioUrl =
        "https://clientlient.dev.edbition.com/Portfolios/" +
        allPortFolioFiles[i].Filename;
      // let portfolioUrl = process.env.HTTP_REQUEST_CLIENTLIENT.replace('/api/v1/', '/') + 'Portfolios/' + allPortFolioFiles[i].Filename;
      const fileName = allPortFolioFiles[i].Filename.split(".");
      const fileExt = fileName[fileName.length - 1];

      const adminUrl = process.env.HTTP_REQUEST_ADMIN;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;


      if (videoSupported.includes(fileExt)) {
        const LessonData = await axios.get(
          `${adminUrl}/lessonUrlById?LessonID=${LessonId}`,
          {
            headers: { Authorization: "Bearer " + token },
          }
        );

        if (!LessonData.status || LessonData.status != 200) {
          return consoleError("There was an error while fetching Lessons data!");
        }

        if (LessonData.data.Data) {
          const videoPath =
            "https://admin.dev.edbition.com/22855951d88aa7a77933b1fd386a011dc9c6d588f7eca18f6b5296e60f62dffe"; // Video Path for Lesson Admin side
          // const videoPath = process.env.VIDEO_ROUTE; // Video Path for Lesson Admin side
          const videoAuthForPath = process.env.VIDEO_ROUTE_AUTH; // Token to access the video path
          LessonUrl = `${videoPath}/${LessonData.data.Data}?token=${videoAuthForPath}`;
        }
      }

      const transcriptData = await axios.get(
        `${adminUrl}/lessonTranscriptById?LessonID=${LessonId}`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );

      if (!transcriptData.status || transcriptData.status != 200) {
        return consoleError("There was an error while fetching Lessons data");
      }

      if (transcriptData.data.Data) {
        // const transcriptPath = "https://admin.dev.edbition.com/Subtitle/";
        TranscriptUrl = transcriptData.data.Data;
      }

      if (fileExt == "mp3") {
        const mp3Path = path.join(
          __dirname,
          "..",
          `/volume/portfolio/${allPortFolioFiles[i].Filename}`
        );
        const toSave = mp3Path.replace("mp3", "wav");
        const wavConverted = allPortFolioFiles[i].Filename.replace(
          "mp3",
          "wav"
        );
        portfolioUrl =
          "https://clientlient.dev.edbition.com/Portfolios" + wavConverted;
        // portfolioUrl = process.env.HTTP_REQUEST_CLIENTLIENT.replace('/api/v1/', '/') + 'Portfolios/' + wavConverted;
        ffmpeg(mp3Path)
          .toFormat("wav")
          .on("error", (error) => {
            console.log(error);
          })
          .on("end", async () => {
            videoDetectionUrl = `${videoDetectionUrl}&docMainUrl=${TranscriptUrl}&audioUserUrl=${portfolioUrl}&portfolioType=audio_detection`;
            axios.get(videoDetectionUrl);
            return consoleError("Loop Terminated! Check Result to Verify");
          })
          .save(toSave);
        return consoleError("Loop Terminated! Check Result to Verify");
      }

      videoDetectionUrl = videoSupported.includes(fileExt)
        ? `${videoDetectionUrl}&videoUrl=${LessonUrl}&portfolioVideo=${portfolioUrl}&portfolioType=video_detection`
        : docSupported.includes(fileExt)
          ? `${videoDetectionUrl}&docMainUrl=${TranscriptUrl}&docUserUrl=${portfolioUrl}&portfolioType=document_detection`
          : pdfSupported.includes(fileExt)
            ? `${videoDetectionUrl}&docMainUrl=${TranscriptUrl}&pdfUserUrl=${portfolioUrl}&portfolioType=pdf_detection`
            : imgSupported.includes(fileExt)
              ? `${videoDetectionUrl}&docMainUrl=${TranscriptUrl}&imgUserUrl=${portfolioUrl}&portfolioType=img_detection`
              : audioSupported.includes(fileExt)
                ? `${videoDetectionUrl}&docMainUrl=${TranscriptUrl}&audioUserUrl=${portfolioUrl}&portfolioType=audio_detection`
                : null;

      if (videoDetectionUrl == null) {
        console.log(`This is invalid entry`);
        return 0;
      }

      if (videoDetectionUrl != null) {
        try {
          await axios.get(videoDetectionUrl);
        } catch (error) {
          console.log(error);
          return consoleError(error);
        }
      }
    }

    return consoleError("Loop Terminated! Check Result to Verify");
  } catch (error) {
    console.log(error);
    if (error.response) {
      console.log(error.response);
    } else {
      console.log(error);
    }
  }
}

// Api to call from python side for database update

async function updateDataBaseScore(req, res) {
  try {
    // Minimum Amount Required To Pass Portfolio
    const minScore = 15;

    const { score, portfolioId, createdBy, key } = req.body;

    if (!portfolioId || !createdBy || !key) {
      return res.status(400).json({
        message: "Invalid Args",
      });
    }

    const response_validator = process.env.RESPONSE_VALIDATOR;

    if (key != response_validator) {
      return res.status(401).json({
        message: "This is an protected route",
      });
    }

    const timestamp = Date.now();
    const isoDate = new Date(timestamp).toISOString();

    // await db.portfolio.update({
    //     Score: score,
    //     ScoreDateTime: Date.now(),
    //     LastModifiedBy: createdBy,
    //     Status: '1'
    // }, { where: { PortfolioID: portfolioId } })

    // return res.status(200).json({
    //     updated: true
    // });

    if (score * 100 >= minScore) {
      await db.portfolio.update(
        {
          Score: score,
          ScoreDateTime: isoDate,
          LastModifiedBy: createdBy,
          Status: "1",
        },
        { where: { PortfolioID: portfolioId } }
      );
    } else {
      await db.portfolio.update(
        {
          Score: score,
          ScoreDateTime: isoDate,
          LastModifiedBy: createdBy,
          Status: "2",
        },
        { where: { PortfolioID: portfolioId } }
      );
    }

    return res.status(200).json({
      updated: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "There was an error while updating the score!",
    });
  }
}

async function getPortfolioCompletionStudent(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(401).json({
        message: "Invalid Token! Login Again",
      });
    }

    const { lessonId, courseId } = req.query;
    if (!lessonId || !courseId) {
      return res.status(400).json({
        message: "Invalid Arguments",
      });
    }

    const portData = await db.portfolio.findAll({
      where: {
        LessonID: lessonId,
        CourseID: courseId,
        StudentID: AccDetails.UserID,
      },
    });

    return res.status(200).json({
      portFolioData: portData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was a server-side error",
    });
  }
}

async function downloadPortfolioFileZip(req, res) {
  try {
    const { AccDetails } = req;
    if (!AccDetails || !AccDetails.UserID) {
      return res.status(400).json({
        message: "Invalid token! Login again"
      })
    }
    const studentSubmittedFiles = await db.portfoliofile.findAll({
      where: { StudentID: AccDetails.UserID },
      attributes: ["Filename"]
    });
    const pathToSave = path.join(__dirname, "..", "/volume/portfolio");

    const { success } = await createZip(pathToSave, studentSubmittedFiles);
    if (!success) {
      return res.status(400).json({
        message: "There was an error while creating zip file!"
      })
    }
    // console.log(studentSubmittedFiles);
    return res.status(200).json({
      message: studentSubmittedFiles
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Sorry! There was an server-side error'
    });
  }
}

//Module exports
module.exports = {
  uploadPortfolio,
  addPortfolio,
  getPortfolioUser,
  getPortfolioFiles,
  validatePortfolios,
  updateDataBaseScore,
  getPortfolioCompletionStudent,
  downloadPortfolioFileZip
};

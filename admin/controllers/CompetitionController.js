const { competition, competitionhistory } = require("../models/index");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const AddRequest = async (req, res) => {
  // const t = await sequelize.transaction();
  try {
    const { AccDetails } = req;
    const result = req.body;

    const createdCompetitionData = await competition.create({
      Grade: result.Grade ?? undefined,
      Format: result.Format ?? undefined,
      CompetitionTitle: result.CompetitionTitle ?? undefined,
      CompetitionDescription: result.CompetitionDescription ?? undefined,
      CompetitionRequirements: result.CompetitionRequirements ?? undefined,
      CompetitionReason: result.CompetitionReason ?? undefined,
      FirstPrize: result.FirstPrize ?? undefined,
      SecondPrize: result.SecondPrize ?? undefined,
      ThirdPrize: result.ThirdPrize ?? undefined,
      StartDate: result.StartDate ?? undefined,
      EndDate: result.EndDate ?? undefined,
      WinnerAnnouncementDate: result.WinnerAnnouncementDate ?? undefined,
      ImgFile: result.ImgFile ?? undefined,
      VideoFile: result.VideoFile ?? undefined,
      SubtitleFile: result.SubtitleFile ?? undefined,
      IsActive: result.IsActive,
      CreatedBy: AccDetails.FirstName,
      LastModifiedBy: AccDetails.FirstName,
    });
    if (createdCompetitionData) {
      // await t.commit();
      return res.status(200).json({
        message: "Competition information added successfully!",
      });
    }
  } catch (error) {
    // await t.rollback();
    return res.status(400).send({
      ErrorCode: "REQUEST",
      message: error.message,
      Error: error,
    });
  }
};

const GetCompetitionsRequest = async (req, res) => {
  try {
    let { page, pageSize, Search } = req.query;
    page = page ? parseInt(page, 10) : 1;
    pageSize = pageSize ? parseInt(pageSize, 10) : 10;
    pageSize = pageSize <= 100 ? pageSize : 10;

    const whereCondition = {};
    if (Search && Search !== "All") {
      whereCondition[Op.or] = [
        //{ CompetitionTitle: { [Op.like]: `%${Search}%` } },
        { Grade: { [Op.like]: `%${Search}%` } },
        { Grade: "All" },
      ];
    }

    whereCondition.IsActive = { [Op.in]: ["0", "1"] };

    const { count, rows } = await competition.findAndCountAll({
      limit: pageSize,
      offset: (page - 1) * pageSize,
      where: whereCondition,
      IsActive: { $ne: "2" },
      order: [["CompetitionID", "ASC"]],
    });

    if (rows !== null) {
      return res.status(200).json({
        TotalCount: count,
        page: page,
        pageSize: pageSize,
        Data: rows,
      });
    } else {
      return res.status(404).json({ message: "No competitions found." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while retrieving competition data.",
      error: error.message,
    });
  }
};
const GetCompetitionRequest = async (req, res) => {
  try {
    const id = req.params.id;

    const whereCondition = {};
    whereCondition.CompetitionID = id;
    whereCondition.IsActive = { [Op.in]: ["0", "1"] };

    const GetCompetitionData = await competition.findOne({
      where: whereCondition,
    });

    if (GetCompetitionData) {
      return res.status(200).json({
        data: GetCompetitionData,
      });
    } else {
      return res.status(404).json({
        message: "Competition Data Not Found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while retrieving competition data.",
      error: error.message,
    });
  }
};
const UpdateRequest = async (req, res) => {
  // const t = await sequelize.transaction();
  try {
    const { AccDetails } = req;
    const id = req.params.id;
    const result = req.body;
    if (result.filesname) {
      var deleteFile = JSON.parse(result.filesname);
      if (deleteFile) {
        var fileNames = await deleteFile.map((file) => {
          return file;
        });
      }
    }
    // Find the existing help data to update
    let existingCompetitionData = await competition.findOne({
      where: { CompetitionID: id },
    });
    if (!existingCompetitionData) {
      return res
        .status(400)
        .send({ ErrorCode: "REQUEST", message: "Competition Data not found" });
    }
    // Create a new entry in helphistory table with the existing help data
    const createdHistoryData = await competitionhistory.create(
      existingCompetitionData.dataValues
    );
    if (!createdHistoryData) {
      // await t.rollback();
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "Failed to create history entry",
      });
    }

    function deleteAndReplaceFile(existingFilePath, newFile) {
      if (fs.existsSync(existingFilePath)) {
        fs.unlink(existingFilePath, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log(
              `The file ${existingFilePath} was deleted successfully.`
            );
          }
        });
      } else {
        console.log(
          `The file ${existingFilePath} does not exist. No action taken.`
        );
      }
    }

    if (existingCompetitionData.ImgFile) {
      const thumbDir = path.join(__dirname, "..", "Thumbnail");
      const imgFilePath = path.join(thumbDir, existingCompetitionData.ImgFile);
      if (
        result.ImgFile &&
        result.ImgFile !== existingCompetitionData.ImgFile
      ) {
        deleteAndReplaceFile(imgFilePath, result.ImgFile);
      }
    }

    if (existingCompetitionData.VideoFile) {
      const videoDir = path.join(__dirname, "..", "Video");
      const videoFilePath = path.join(
        videoDir,
        existingCompetitionData.VideoFile
      );
      if (
        result.VideoFile &&
        result.VideoFile !== existingCompetitionData.VideoFile
      ) {
        deleteAndReplaceFile(videoFilePath, result.VideoFile);
      }
    }

    if (existingCompetitionData.SubtitleFile) {
      const subtitleDir = path.join(__dirname, "..", "Subtitle");
      const subtitleFilePath = path.join(
        subtitleDir,
        existingCompetitionData.SubtitleFile
      );
      if (
        result.SubtitleFile &&
        result.SubtitleFile !== existingCompetitionData.SubtitleFile
      ) {
        deleteAndReplaceFile(subtitleFilePath, result.SubtitleFile);
      }
    }

    //return res.status(400).json(fileNames);

    // if (fileNames) {
    //     const parentDir = path.join(__dirname, '..', "upload");
    //     const imagePath = parentDir;
    //     if (fileNames[0]) {
    //         await fs.unlinkSync(`${imagePath}/` + fileNames[0]);
    //     }
    //     if (fileNames[1]) {
    //         await fs.unlinkSync(`${imagePath}/` + fileNames[1]);
    //     }
    //     if (fileNames[2]) {
    //         await fs.unlinkSync(`${imagePath}/` + fileNames[2]);
    //     }
    // }

    if (fileNames) {
      const parentDir = path.join(__dirname, "..", "upload");
      const imagePath = parentDir;
      const fsSync = require("fs");

      for (const fileName of fileNames) {
        if (fileName) {
          const filePath = `${imagePath}/${fileName}`;
          if (fsSync.existsSync(filePath)) {
            // Check if file exists
            try {
              await fs.unlink(filePath);
            } catch (err) {
              console.error(`Error deleting file ${filePath}:`, err);
            }
          } else {
            console.warn(`File not found: ${filePath}`);
          }
        }
      }
    }

    if (fileNames && fileNames.length > 0) {
      const updatedFileTypes = fileNames.map(async (fileName) => {
        const file = fileName.split("_");

        if (file[0] == "EventThumbnail") {
          await existingCompetitionData.update(
            { ImgFile: null, CompetitionID: id },
            { where: { CompetitionID: id } }
          );
        }
        if (file[0] == "EventVideo") {
          await existingCompetitionData.update(
            { VideoFile: null, CompetitionID: id },
            { where: { CompetitionID: id } }
          );
        }
        if (file[0] == "EventSubtitle") {
          await existingCompetitionData.update(
            { SubtitleFile: null },
            { where: { CompetitionID: id } }
          );
        }
      });
    }
    if (result.ImgFile || result.VideoFile || result.SubtitleFile) {
      await existingCompetitionData.update(
        {
          ImgFile: result.ImgFile,
          VideoFile: result.VideoFile,
          SubtitleFile: result.SubtitleFile,
        },
        { where: { CompetitionID: id } }
      );
    }

    const UpdateCompetitionData = await competition.update(
      {
        Grade: result.Grade ?? existingCompetitionData.Grade,
        Format: result.Format ?? existingCompetitionData.Format,
        CompetitionTitle:
          result.CompetitionTitle ?? existingCompetitionData.CompetitionTitle,
        CompetitionDescription:
          result.CompetitionDescription ??
          existingCompetitionData.CompetitionDescription,
        CompetitionRequirements:
          result.CompetitionRequirements ??
          existingCompetitionData.CompetitionRequirements,
        CompetitionReason:
          result.CompetitionReason ?? existingCompetitionData.CompetitionReason,
        FirstPrize: result.FirstPrize ?? existingCompetitionData.FirstPrize,
        SecondPrize: result.SecondPrize ?? existingCompetitionData.SecondPrize,
        ThirdPrize: result.ThirdPrize ?? existingCompetitionData.ThirdPrize,
        StartDate: result.StartDate ?? existingCompetitionData.StartDate,
        EndDate: result.EndDate ?? existingCompetitionData.EndDate,
        WinnerAnnouncementDate:
          result.WinnerAnnouncementDate ??
          existingCompetitionData.WinnerAnnouncementDate,
        IsActive: result.IsActive ?? existingCompetitionData.IsActive,
        CreatedBy: AccDetails.FirstName,
        LastModifiedBy: AccDetails.FirstName,
      },
      { where: { CompetitionID: id } }
    );

    if (UpdateCompetitionData) {
      // await t.commit();
      return res.status(200).json({
        Message: "Competition information updated successfully!",
      });
    }
  } catch (error) {
    // await t.rollback();
    console.log(error);
    return res.status(400).send({
      ErrorCode: "REQUEST 12121",
      message: error.message,
      Error: fileNames,
    });
  }
};

const DeleteRequest = async (req, res) => {
  // const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const GetCompetitionData = await competition.findOne({
      where: { CompetitionID: id },
    });
    if (!GetCompetitionData) {
      return res
        .status(400)
        .send({ ErrorCode: "REQUEST", message: "Competition Data not found" });
    }

    const CreateHelpHistoryData = await competitionhistory.create(
      GetCompetitionData.dataValues
    );
    if (!CreateHelpHistoryData) {
      // await t.rollback();
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "Competition Data Not inserted in History Table",
      });
    }
    const DeleteCompetitionData = await competition.update(
      {
        IsActive: "2",
      },
      { where: { CompetitionID: id } }
    );

    // const parentDir = path.join(__dirname, '..', 'upload');

    // const filesToDelete = [
    //     GetCompetitionData.ImgFile,
    //     GetCompetitionData.VideoFile,
    //     GetCompetitionData.SubtitleFile
    // ];

    // for (const file of filesToDelete) {
    //     if (file) {
    //         const filePath = path.join(parentDir, file);
    //         try {
    //             await fs.unlink(filePath);
    //             console.log(`The file ${filePath} was deleted successfully.`);
    //         } catch (err) {
    //             if (err.code !== 'ENOENT') {
    //                 console.log(`Error deleting file ${filePath}:`, err);
    //             } else {
    //                 console.log(`The file ${filePath} does not exist.`);
    //             }
    //         }
    //     }
    // }

    // const DeleteCompetitionData = await competition.destroy({ where: { CompetitionID: id } });
    if (!DeleteCompetitionData) {
      // await t.rollback();
      return res.status(400).send({
        ErrorCode: "REQUEST",
        message: "Competition Data Not deleted",
      });
    }
    // await t.commit();
    return res.status(201).json({ message: "Data Deleted successfully" });
  } catch (error) {
    // await t.rollback();
    return res.status(500).json({ error: error.message });
  }
};

// HTTP REQUEST

const GetCompetitionHttpRequest = async (req, res) => {
  try {
    const id = req.params.id;

    const whereCondition = {};
    whereCondition.CompetitionID = id;
    whereCondition.IsActive = { [Op.in]: ["0", "1"] };

    const GetCompetitionData = await competition.findOne({
      where: whereCondition,
    });

    if (GetCompetitionData) {
      return res.status(200).json({
        TotalCount: GetCompetitionData.length,
        Data: GetCompetitionData,
      });
    } else {
      return res.status(400).json({ Data: "Competition Data Not Gets!" });
    }
  } catch (error) {
    return res.status(400).send({
      ErrorCode: "REQUEST",
      message: error.message,
      Error: error,
    });
  }
};

const GetCompetitionsHttpRequest = async (req, res) => {
  try {
    const { studentGrade, UserId } = req.query;
    const { filters } = req.query;
    const parsedFilter = JSON.parse(filters);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); 

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (!studentGrade || !UserId) {
      return res.status(401).json({
        message: "Something went wrong! Grade/UserId is invalid",
      });
    } else {
      //Setting Paginations
      const page = Number(parsedFilter.page) ? Number(parsedFilter.page) : 1;
      const limit = 5;
      const offset = parsedFilter.offset ? parsedFilter.offset : (page - 1) * limit;

      const gradeArr = [
        "SK",
        "JK",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ];

      let result = []; // Result for api
      let resultFilterArr = []; // Check whether the competition already exist in result array. This is used to filter out the competition which i do not want to show

      let filterGrade = [studentGrade]; // Array in which I will be setting one grade forward and backward data
      filterGrade.push(gradeArr[gradeArr.indexOf(studentGrade) - 1]); // Push the previous grade
      filterGrade.push(gradeArr[gradeArr.indexOf(studentGrade) + 1]); // Push the next grade

      const upgradeGradeArr = filterGrade.filter((grade) => grade != undefined); // Filter out undefined values

      // Excluding the events which are already submitted
      const clientActivity = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;
      const respEventSubmittedList = await axios.get(
        `${clientActivity}/evnetSubmit/get_event?UserID=${UserId}`,
        {
          // Find it first
          headers: { Authorization: "Bearer " + token },
        }
      );

      if (
        respEventSubmittedList.data.submittedEvents &&
        respEventSubmittedList.data.submittedEvents.length > 0
      ) {
        const subEvent = respEventSubmittedList.data.submittedEvents;
        const onlyId = subEvent.map((singleEvent) => {
          return singleEvent.CompetitionID;
        });
        resultFilterArr = [...onlyId]; // Appending it to filter array so that the competition data gets excluded
      }

      // console.log(upgradeGradeArr); 
      await Promise.all(
        upgradeGradeArr.map(async (single) => {
          const gradeWiseCompData = await competition.findAll({
            where: {
              [Op.or]: [
                {
                  Grade: {
                    [Op.like]: `%${single}%`,
                  },
                },
                {
                  Grade: "All",
                },
              ],
              StartDate: {
                [Op.lte]: endOfToday, 
              },
              EndDate: {
                [Op.gte]: startOfToday,
              },
            },
            limit: limit,
            offset: offset,
          });

          gradeWiseCompData.map((singleValue) => {
            if (!resultFilterArr.includes(singleValue.CompetitionID)) {
              result.push(singleValue);
              resultFilterArr.push(singleValue.CompetitionID);
            }
          });
        })
      );

      return res.status(200).json({
        Data: result,
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ ErrorCode: "REQUEST", message: error.message, Error: error });
  }
};

async function getSubmittedEvents(req, res) {
  try {
    const { UserId } = req.query;
    const { filters } = req.query;
    if (!UserId) {
      return res.status(401).json({
        message: "Something went wrong! UserId is invalid",
      });
    } else {
      const limit = filters.limit || 5;
      const offset = filters.offset;
      let resultFilterArr = [];

      const clientActivity = process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;
      const respEventSubmittedList = await axios.get(
        `${clientActivity}/evnetSubmit/get_event?UserID=${UserId}&filters=${filters}`,
        {
          // Find it first
          headers: { Authorization: "Bearer " + token },
        }
      );

      if (
        respEventSubmittedList.data.submittedEvents &&
        respEventSubmittedList.data.submittedEvents.length > 0
      ) {
        const subEvent = respEventSubmittedList.data.submittedEvents;
        const onlyId = subEvent.map((singleEvent) => {
          return singleEvent.CompetitionID;
        });
        resultFilterArr = [...onlyId]; // Appending it to filter array so that the competition data gets excluded
      }

      //Now resultFilterArr consists for all the submitted id
      //Finding all the data from competition table for submitted ids
      const allSubmittedData = await competition.findAll({
        where: { CompetitionID: { [Op.in]: resultFilterArr } },
        limit: limit,
        offset: offset,
      });

      return res.status(200).json({
        message: "Event Submitted Data",
        Data: allSubmittedData,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}

module.exports = {
  AddRequest,
  GetCompetitionsRequest,
  GetCompetitionRequest,
  UpdateRequest,
  DeleteRequest,
  GetCompetitionsHttpRequest,
  GetCompetitionHttpRequest,
  getSubmittedEvents,
};

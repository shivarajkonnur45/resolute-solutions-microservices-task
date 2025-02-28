const {
  sequelize,
  CourseModel,
  CourseCategory,
  Module,
} = require("../models/index");
const path = require("path");
const { Op } = require("sequelize");
const cron = require("node-cron");
// const crypto = require('crypto');
const asyncFfmpegHandler = require("../helpers/getVideoDuration");
const videoDir = path.join(__dirname, "..", "/volume/Video/");

//! Course Upload (Main) Controller
async function addCourse(req, res) {
  // const t = await sequelize.transaction();
  try {
    const {
      courseCategory,
      courseGrade,
      courseTag,
      courseTitle,
      courseDesc,
      certificateTitle,
      trophyTitle,
      trophyDesc,
      comingSoon
    } = req.body;

    

    const createdBy = req.AccDetails.FirstName + " " + req.AccDetails.LastName;

    const isEditorCheck = req.AccDetails.AccountType; // Editor Check for Course Active set 0

    // console.log(typeof comingSoon, typeof isEditorCheck, comingSoon, isEditorCheck);

    const toSetIsActive = comingSoon && comingSoon != "undefined" && comingSoon == '1' ? "3" : isEditorCheck == 5 ? "0" : "1";
    

    let parsed = JSON.parse(courseCategory);
    let parsedGrade = await JSON.parse(courseGrade).toString();

    const allCourseID = await CourseCategory.findAll({
      where: {
        CategoryName: {
          [Op.in]: parsed,
        },
      },
    });
    const ids = await allCourseID.map(
      (course) => course.dataValues.CourseCategoryID
    );
    const stringedID = await ids.toString();
    const Ct = req?.Ct; // CourseThumbnail
    const CSt = req?.CSt; // CourseSubtitle
    const Cet = req?.CeT; // CourseCertificate
    const Mt = req?.Mt; // ModuleThumbnails
    const Tt = req?.Tt; // TrophyThumbnail
    const VCt = req?.VCt; // CourseVideo
    const VMt = req?.VMt; // ModuleVideo
    const SMt = req?.SMt; // ModuleSubtitle

    let courseDuration = 0;

    if(VCt){
      courseDuration = await asyncFfmpegHandler(`${videoDir}/${VCt}`);
    }

    const courseCreation = await CourseModel.create({
      courseCategory: stringedID,
      courseGrade: parsedGrade == "All" ? "5,6,7,8,9,10,11,12" : parsedGrade,
      courseTag: courseTag,
      courseTitle: courseTitle,
      courseDesc: courseDesc,
      certificateTitle: certificateTitle,
      trophyTitle: trophyTitle,
      trophyDesc: trophyDesc,
      courseImage: Ct,
      certificateImage: Cet,
      trophyImage: Tt,
      courseVideo: VCt,
      courseVideoDuration: courseDuration,
      courseSubtitle: CSt,
      createdBy: createdBy,
      createdOn: Date.now(),
      isActive: toSetIsActive,
    });
    if (courseCreation) {
      const { CourseModule } = req.body;
      const parsedCourseModule = JSON.parse(CourseModule);
      let moduleIDs = [];
      if (parsedCourseModule.length > 0) {
        await Promise.all(
          parsedCourseModule.map(async (singleModule, index) => {
            const parsedModule = singleModule;
            const addedModule = await Module.create({
              Title: parsedModule.Title,
              Description: parsedModule.Description,
              courseId: courseCreation.courseId,
              position: parsedModule.position,
            });
            moduleIDs.push({
              moduleID: addedModule.ModuleID,
              modulePosition: parsedModule.position,
            });
            if (Mt && Mt.length > 0) {
              // console.log("Image", Mt);
              Mt.map(async (singleMt) => {
                const splitMt = singleMt.split("_");
                const indexMt = await splitMt[splitMt.length - 1]
                  .replace(".jpg", "")
                  .replace(".png", "");
                if (indexMt == parsedModule.position) {
                  await Module.update(
                    { moduleImage: singleMt },
                    { where: { ModuleID: addedModule.ModuleID } }
                  );
                }
              });
            }
            if (VMt && VMt.length > 0) {
              VMt.map(async (singleVMt) => {
                const splitVMt = singleVMt.split("_");
                const indexVMt = splitVMt[splitVMt.length - 1].replace(
                  ".mp4",
                  ""
                );
                if (indexVMt == parsedModule.position) {
                  const moduleDuration = await asyncFfmpegHandler(`${videoDir}/${singleVMt}`);
                  await Module.update(
                    {
                      moduleVideo: singleVMt,
                      moduleVideoDuration: moduleDuration,
                    },
                    { where: { ModuleID: addedModule.ModuleID } }
                  );
                }
              });
            }
            if (SMt && SMt.length > 0) {
              SMt.map(async (singleSMt) => {
                const splitSMt = singleSMt.split("_");
                const indexSMt = splitSMt[splitSMt.length - 1].replace(
                  ".txt",
                  ""
                );
                if (indexSMt == parsedModule.position) {
                  await Module.update(
                    { moduleSubtitle: singleSMt },
                    { where: { ModuleID: addedModule.ModuleID } }
                  );
                }
              });
            }
          })
        );
      }

      cron.schedule("* 22 * * *", async () => {
        try {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - 1);
          const recordsToDelete = await CourseModel.findAll({
            where: {
              isValid: "0",
            },
          });
          await Promise.all(
            recordsToDelete.map((record) =>
              record.destroy({ include: [Module] })
            )
          ); // Refreshing the server and deleting the course with no valid lesson
        } catch (error) {
          console.log(error);
        }
      });
      // await t.commit();
      return res.status(200).json({
        message: "Course Added Successfully",
        addedModules: moduleIDs,
        courseAddedId: courseCreation.courseId,
      });
    } else {
      res.status(401).json({
        message: "Error while creating course/module",
      });
    }
  } catch (error) {
    // await t.rollback();
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
}
//! ------------------------------END-------------------------------------------->>

//! Course Category Check and Upload Controller
async function Categorycheck(req, res, next) {
  // const t = await sequelize.transaction();
  try {
    const { courseCategory } = req.body;
    let parsed = JSON.parse(courseCategory);
    // console.log(`!!!!!!!!!!!!!!!!!!!!!!`);
    // console.log(parsed);
    // console.log(`!!!!!!!!!!!!!!!!!!!!!!`);
    const categroie = await CourseCategory.findAll({
      where: {
        CategoryName: {
          [Op.like]: `%${parsed}%`,
        },
      },
      collate: "C",
    });

    const ids = await categroie.map((course) => course.dataValues.CategoryName);
    let leftOuts = [];
    let linkedIds = [];

    for (let i = 0; i < parsed.length; i++) {
      if (!ids.includes(parsed[i])) {
        leftOuts.push(parsed[i]);
      } else {
        linkedIds.push(parsed[i]);
      }
    }

    if (leftOuts.length > 0) {
      let pushedData = [];
      leftOuts.map((singleCatCreate) => {
        pushedData.push({ CategoryName: singleCatCreate });
      });
      await CourseCategory.bulkCreate(pushedData);
    }

    if (linkedIds.length > 0) {
      await CourseCategory.update(
        {
          isLinkedTo: sequelize.literal("isLinkedTo + 1"),
        },
        {
          where: { CategoryName: linkedIds },
        }
      );
    }
    next();
  } catch (error) {
    // await t.rollback();
    console.log(error);
    return res.status(401).json({
      message: "Error while creating Categories",
    });
  }
}
//! --------------------------------END------------------------------------------>>

//! Course Files Upload Controller
async function uploadCoursefiles(req, res, next) {
  try {
    if (req.files) {
      // console.log(`------------<>-------------`);
      // console.log(req.files);
      // console.log(`------------<>-------------`);
      let moduleArray = [];
      let moduleVideoArray = [];
      let subtitleArray = [];
      // let toAppend = Date.now()
      if (req.files.Thumbnail) {
        const imageFile = req.files.Thumbnail;
        const isArrayValidate = Array.isArray(imageFile);
        if (isArrayValidate == false) {
          // Check if it is object
          let imageReqArray = await imageFile.name.split("_");
          const imgName = imageReqArray[0];
          if (imgName === "CourseThumbnail") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Thumbnail/"
            );
            req.Ct = imageFile.name;
            await imageFile.mv(uploadDir + imageFile.name);
          }
          if (imgName === "CertificateThumbnail") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Thumbnail/"
            );
            req.CeT = imageFile.name;
            await imageFile.mv(uploadDir + imageFile.name);
          }
          if (imgName === "TrophyThumbnail") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Thumbnail/"
            );
            req.Tt = imageFile.name;
            await imageFile.mv(uploadDir + imageFile.name);
          }
          if (imgName === "ModuleThumbnail") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Thumbnail/"
            );
            moduleArray.push(imageFile.name);
            req.Mt = moduleArray;
            await imageFile.mv(uploadDir + imageFile.name);
          }
        }
        if (isArrayValidate == true) {
          // Check if it is array
          await Promise.all(
            imageFile.map(async (singleThumbFile) => {
              let imageReqArray = await singleThumbFile.name.split("_");
              const imgName = imageReqArray[0];
              // const position = imageReqArray[imageReqArray.length - 1]; (Required if any)
              if (imgName === "CourseThumbnail") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Thumbnail/"
                );
                req.Ct = singleThumbFile.name;
                await singleThumbFile.mv(uploadDir + singleThumbFile.name);
              }
              if (imgName === "CertificateThumbnail") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Thumbnail/"
                );
                req.CeT = singleThumbFile.name;
                await singleThumbFile.mv(uploadDir + singleThumbFile.name);
              }
              if (imgName === "TrophyThumbnail") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Thumbnail/"
                );
                req.Tt = singleThumbFile.name;
                await singleThumbFile.mv(uploadDir + singleThumbFile.name);
              }
              if (imgName === "ModuleThumbnail") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Thumbnail/"
                );
                moduleArray.push(singleThumbFile.name);
                req.Mt = moduleArray;
                await singleThumbFile.mv(uploadDir + singleThumbFile.name);
              }
            })
          );
        }
      }
      if (req.files.Video) {
        const videoFile = req.files.Video;
        const isArrayValidate = Array.isArray(videoFile);
        if (isArrayValidate == false) {
          // Check if its object
          let videoReqArray = await videoFile.name.split("_");
          const videoName = videoReqArray[0];
          if (videoName === "CourseVideo") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Video/"
            );
            req.VCt = videoFile.name;
            await videoFile.mv(uploadDir + videoFile.name);
          }
          if (videoName === "ModuleVideo") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Video/"
            );
            moduleVideoArray.push(videoFile.name);
            req.VMt = moduleVideoArray;
            await videoFile.mv(uploadDir + videoFile.name);
          }
        }
        if (isArrayValidate == true) {
          // Check if its array
          await Promise.all(
            videoFile.map(async (singleVideoFile) => {
              let videoReqArray = await singleVideoFile.name.split("_");
              const videoName = videoReqArray[0];
              if (videoName === "CourseVideo") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Video/"
                );
                req.VCt = singleVideoFile.name;
                await singleVideoFile.mv(uploadDir + singleVideoFile.name);
              }
              if (videoName === "ModuleVideo") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Video/"
                );
                moduleVideoArray.push(singleVideoFile.name);
                req.VMt = moduleVideoArray;
                await singleVideoFile.mv(uploadDir + singleVideoFile.name);
              }
            })
          );
        }
      }
      if (req.files.Subtitle) {
        const subtitleFile = req.files.Subtitle;
        const isArrayValidate = Array.isArray(subtitleFile);
        if (isArrayValidate == false) {
          // Check if its object
          let subReqArray = await subtitleFile.name.split("_");
          const subName = subReqArray[0];
          if (subName === "CourseSubtitle") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Subtitle/"
            );
            req.CSt = subtitleFile.name;
            await subtitleFile.mv(uploadDir + subtitleFile.name);
          }
          if (subName === "ModuleSubtitle") {
            const uploadDir = await path.join(
              __dirname,
              "..",
              "/volume/Subtitle/"
            );
            subtitleArray.push(subtitleFile.name);
            req.SMt = subtitleArray;
            await subtitleFile.mv(uploadDir + subtitleFile.name);
          }
        }
        if (isArrayValidate == true) {
          // Check if its array
          await Promise.all(
            subtitleFile.map(async (singleSub) => {
              let subReqArray = await singleSub.name.split("_");
              const subName = subReqArray[0];
              if (subName === "CourseSubtitle") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Subtitle/"
                );
                req.CSt = singleSub.name;
                await singleSub.mv(uploadDir + singleSub.name);
              }
              if (subName === "ModuleSubtitle") {
                const uploadDir = await path.join(
                  __dirname,
                  "..",
                  "/volume/Subtitle/"
                );
                subtitleArray.push(singleSub.name);
                req.SMt = subtitleArray;
                await singleSub.mv(uploadDir + singleSub.name);
              }
            })
          );
        }
      }
      next();
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Sorry! There was an error while uploading files",
    });
  }
}
//! --------------------------------END------------------------------------------>>

module.exports = { addCourse, Categorycheck, uploadCoursefiles };

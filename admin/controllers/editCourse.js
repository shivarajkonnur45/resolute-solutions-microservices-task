const { sequelize, CourseModel, CourseCategory, Module, coursehistory, ModuleHistory, CourseCategoryHistory } = require('../models/index');
const path = require("path");
const { Op } = require("sequelize");
const fs = require('fs');
const asyncFfmpegHandler = require("../helpers/getVideoDuration");
const videoDir = path.join(__dirname, "..", "/volume/Video/");

//! Edit Course starts here ----------------->>>>>>>>>>>>>>>>>>>
async function editCourse(req, res) {
    // const t = await sequelize.transaction();
    try {
        const { courseID } = req.params;

        const { courseCategory, courseGrade, courseTag, courseTitle, courseDesc, certificateTitle, trophyTitle, trophyDesc, comingSoon } = req.body;
        console.log(req.body)
        const createdBy = req.AccDetails.FirstName + " " + req.AccDetails.LastName;
        let parsed = JSON.parse(courseCategory);
        let parsedGrade = await JSON.parse(courseGrade).toString();
        const allCourseID = await CourseCategory.findAll({
            where: {
                CategoryName: {
                    [Op.in]: parsed
                }
            }
        })
        const ids = await allCourseID.map(course => course.dataValues.CourseCategoryID);
        const stringedID = await ids.toString();
        const Ct = req?.Ct; // CourseThumbnail
        const CSt = req?.CSt; // CourseSubtitle
        const Cet = req?.CeT; // CertificateThumbnail
        const Mt = req?.Mt; // ModuleThumbnail
        const Tt = req?.Tt; // TrophyThumbnail
        const VCt = req?.VCt; // CourseVideo
        const VMt = req?.VMt; // ModuleVideo
        const SMt = req?.SMt; // ModuleSubtitle

        let courseDuration = 0;

        if (VCt) {
            courseDuration = await asyncFfmpegHandler(`${videoDir}/${VCt}`);
        }

        // Maintain History Table 
        const GetCourseData = await CourseModel.findOne({ where: { courseId: courseID } });
        if (GetCourseData) {
            const CreateCourseHistoryData = await coursehistory.create(GetCourseData.dataValues,);
            if (!CreateCourseHistoryData) {
                // await t.rollback();
                return res.status(400).send({ ErrorCode: "REQUEST", message: "Course Data Not insert in History Table" });
            };
        };
        const toUpdateCourse = await CourseModel.findByPk(courseID);
        const toSetIsActive = comingSoon && comingSoon != "undefined" && comingSoon == '1' ? "3" : "1";

        const courseCreation = await CourseModel.update({
            courseCategory: stringedID,
            courseGrade: parsedGrade,
            courseTag: courseTag,
            courseTitle: courseTitle,
            courseDesc: courseDesc,
            certificateTitle: certificateTitle,
            trophyTitle: trophyTitle,
            trophyDesc: trophyDesc,
            courseImage: Ct === undefined ? toUpdateCourse.courseImage : Ct,
            certificateImage: Cet === undefined ? toUpdateCourse.certificateImage : Cet,
            trophyImage: Tt === undefined ? toUpdateCourse.trophyImage : Tt,
            courseVideo: VCt === undefined ? toUpdateCourse.courseVideo : VCt,
            courseSubtitle: CSt === undefined ? toUpdateCourse.courseSubtitle : CSt,
            createdBy: createdBy,
            createdOn: Date.now(),
            isActive: toSetIsActive,
            courseVideoDuration: VCt === undefined ? toUpdateCourse.courseVideoDuration : courseDuration,
        }, { where: { courseId: courseID } });
        if (courseCreation) {
            const { CourseModule } = req.body;
            const parsedCourseModule = JSON.parse(CourseModule);

            if (parsedCourseModule.length > 0) {
                await Promise.all(parsedCourseModule.map(async (singleModule) => {
                    const parsedModule = singleModule;

                    if (parsedModule.CourseModuleID) {

                        // //! Maintain History Table 
                        // let existingModuleData = await Module.findOne({ where: { ModuleID: parsedModule.CourseModuleID } });

                        // if (existingModuleData) {
                        //     const createdHistoryData = await ModuleHistory.create(existingModuleData.dataValues);
                        //     if (!createdHistoryData) {
                        //         return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create history entry" });
                        //     }
                        // };
                        // //! History Table end

                        const addedModule = await Module.update({ Title: parsedModule.Title, Description: parsedModule.Description, courseId: courseCreation.courseId, position: parsedModule.position }, { where: { ModuleID: parsedModule.CourseModuleID } });
                        if (Mt && Mt.length > 0) {
                            let mtCheck = [];
                            await Promise.all(Mt.map(async (singleMt) => {
                                const splitMt = singleMt.split("_");
                                const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                mtCheck.push(indexMt);
                                if (indexMt == parsedModule.position) {
                                    await ModuleHistory.update({ moduleImage: singleMt }, { where: { ModuleHistoryID: parsedModule.CourseModuleID } });
                                    await Module.update({ moduleImage: singleMt }, { where: { ModuleID: parsedModule.CourseModuleID } });
                                }
                            }));
                            if (!mtCheck.includes(parsedModule.position.toString())) {
                                await Module.update({ moduleImage: null }, { where: { ModuleID: parsedModule.CourseModuleID } });
                            }
                        }

                        if (VMt && VMt.length > 0) {
                            let VMtCheck = [];
                            await Promise.all(VMt.map(async (singleVMt) => {
                                const splitVMt = singleVMt.split("_");
                                const indexVMt = splitVMt[splitVMt.length - 1].replace('.mp4', '');
                                VMtCheck.push(indexVMt);
                                if (indexVMt == parsedModule.position) {
                                    const moduleDuration = await asyncFfmpegHandler(`${videoDir}/${singleVMt}`);
                                    await ModuleHistory.update({ moduleVideo: singleVMt }, { where: { ModuleHistoryID: parsedModule.CourseModuleID } });
                                    await Module.update({ moduleVideo: singleVMt, moduleVideoDuration: moduleDuration }, { where: { ModuleID: parsedModule.CourseModuleID } });
                                }
                            }));
                            if (!VMtCheck.includes(parsedModule.position.toString())) {
                                await Module.update({ moduleVideo: null }, { where: { ModuleID: parsedModule.CourseModuleID } });
                            }
                        }

                        if (SMt && SMt.length > 0) {
                            let SmtCheck = [];
                            await Promise.all(SMt.map(async (singleSMt) => {
                                const splitSMt = singleSMt.split("_");
                                const indexSMt = splitSMt[splitSMt.length - 1].replace('.txt', '');
                                SmtCheck.push(indexSMt);
                                if (indexSMt == parsedModule.position) {
                                    await ModuleHistory.update({ moduleSubtitle: singleSMt }, { where: { ModuleHistoryID: parsedModule.CourseModuleID } });
                                    await Module.update({ moduleSubtitle: singleSMt }, { where: { ModuleID: parsedModule.CourseModuleID } });
                                }
                            }));
                            if (!SmtCheck.includes(parsedModule.position.toString())) {
                                await Module.update({ moduleSubtitle: null }, { where: { ModuleID: parsedModule.CourseModuleID } });
                            }
                        }

                    }
                    else {
                        await Module.create({ Title: parsedModule.Title, Description: parsedModule.Description, courseId: courseID, position: parsedModule.position })
                    }
                }))
            }
            // await t.commit();
            return res.status(200).json({
                message: "Course Edited Successfully"
            })
        }
        else {
            // await t.rollback();
            res.status(401).json({
                message: "Error while editing course/module"
            })
        }

    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}
//! Edit Course ends here ----------------->>>>>>>>>>>>>>>>>>>

//! Edit Course Files starts here ----------------->>>>>>>>>>>>>>>>>>>

async function editCoursefiles(req, res, next) {
    try {
        if (req.files) {

            let moduleArray = [];
            let moduleVideoArray = [];
            let subtitleArray = [];
            if (req.files.Thumbnail) {
                const imageFile = req.files.Thumbnail;
                const isArrayValidate = Array.isArray(imageFile);

                if (isArrayValidate == false) {
                    let imageReqArray = await imageFile.name.split("_");
                    const imgName = imageReqArray[0];
                    // const position = imageReqArray[imageReqArray.length - 1];
                    if (imgName === "CourseThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        req.Ct = imageFile.name;
                        await imageFile.mv(uploadDir + imageFile.name);

                    }
                    if (imgName === "CertificateThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        req.CeT = imageFile.name;
                        await imageFile.mv(uploadDir + imageFile.name);

                    }
                    if (imgName === "TrophyThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        req.Tt = imageFile.name;
                        await imageFile.mv(uploadDir + imageFile.name);

                    }
                    if (imgName === "ModuleThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        moduleArray.push(imageFile.name);
                        req.Mt = moduleArray;
                        await imageFile.mv(uploadDir + imageFile.name);
                    }
                }

                if (isArrayValidate == true) {
                    await Promise.all(imageFile.map(async (singleThumbFile) => {
                        let imageReqArray = await singleThumbFile.name.split("_");
                        const imgName = imageReqArray[0];
                        // const position = imageReqArray[imageReqArray.length - 1];
                        if (imgName === "CourseThumbnail") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                            req.Ct = singleThumbFile.name;
                            await singleThumbFile.mv(uploadDir + singleThumbFile.name);

                        }
                        if (imgName === "CertificateThumbnail") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                            req.CeT = singleThumbFile.name;
                            await singleThumbFile.mv(uploadDir + singleThumbFile.name);

                        }
                        if (imgName === "TrophyThumbnail") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                            req.Tt = singleThumbFile.name;
                            await singleThumbFile.mv(uploadDir + singleThumbFile.name);

                        }
                        if (imgName === "ModuleThumbnail") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                            moduleArray.push(singleThumbFile.name);
                            req.Mt = moduleArray;
                            await singleThumbFile.mv(uploadDir + singleThumbFile.name);
                        }
                    }));
                }

            }
            if (req.files.Video) {
                const videoFile = req.files.Video;
                const isArrayValidate = Array.isArray(videoFile);

                if (isArrayValidate == false) {
                    let videoReqArray = await videoFile.name.split("_");
                    const videoName = videoReqArray[0];
                    if (videoName === "CourseVideo") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                        req.VCt = videoFile.name;
                        await videoFile.mv(uploadDir + videoFile.name);

                    }
                    if (videoName === "ModuleVideo") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                        moduleVideoArray.push(videoFile.name);
                        req.VMt = moduleVideoArray;
                        await videoFile.mv(uploadDir + videoFile.name);
                    }
                }

                if (isArrayValidate == true) {
                    await Promise.all(videoFile.map(async (singleVideoFile) => {
                        let videoReqArray = await singleVideoFile.name.split("_");
                        const videoName = videoReqArray[0];
                        if (videoName === "CourseVideo") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                            req.VCt = singleVideoFile.name;
                            await singleVideoFile.mv(uploadDir + singleVideoFile.name);

                        }
                        if (videoName === "ModuleVideo") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                            moduleVideoArray.push(singleVideoFile.name);
                            req.VMt = moduleVideoArray;
                            await singleVideoFile.mv(uploadDir + singleVideoFile.name);
                        }
                    }));
                }

            }
            if (req.files.Subtitle) {
                const subtitleFile = req.files.Subtitle;

                const isArrayValidate = Array.isArray(subtitleFile);

                if (isArrayValidate == false) {
                    let subReqArray = await subtitleFile.name.split("_");
                    const subName = subReqArray[0];
                    if (subName === "ModuleSubtitle") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                        subtitleArray.push(subtitleFile.name);
                        req.SMt = subtitleArray;
                        await subtitleFile.mv(uploadDir + subtitleFile.name);
                    }
                    if (subName === "CourseSubtitle") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                        req.CSt = subtitleFile.name;
                        await subtitleFile.mv(uploadDir + subtitleFile.name);
                    }
                }

                if (isArrayValidate == true) {
                    await Promise.all(subtitleFile.map(async (singleSub) => {
                        let subReqArray = await singleSub.name.split("_");
                        const subName = subReqArray[0];
                        if (subName === "ModuleSubtitle") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                            subtitleArray.push(singleSub.name);
                            req.SMt = subtitleArray;
                            await singleSub.mv(uploadDir + singleSub.name);
                        }
                        if (subName === "CourseSubtitle") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                            req.CSt = singleSub.name;
                            await singleSub.mv(uploadDir + singleSub.name);
                        }
                    }));
                }
            }
            next();
        }
        else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an error while uploading files"
        })
    }
}
//! Edit Course Files ends here ----------------->>>>>>>>>>>>>>>>>>>

//! Edit Course Category starts here ----------------->>>>>>>>>>>>>>>>>>>

// async function editCategory(req, res) {
//     try {
//         const { courseID } = req.params;
//         const courseData = await CourseModel.findByPk(courseID);

//         if (!courseID || !courseData) {
//             return res.status(404).json({
//                 message: "Course not found"
//             })
//         }
//         let toEditCat = [];
//         const courseCatArr = courseData.courseCategory.split(",");

//         if (courseCatArr.length > 0) {
//             for (let i = 0; i < courseCatArr.length; i++) {
//                 const courseLinked = await CourseModel.findOne({
//                     where: {
//                         courseCategory: { [Op.like]: `%${courseCatArr[i]}%` },
//                         courseId: { [Op.ne]: courseID }
//                     }
//                 });
//                 if (!courseLinked) {
//                     toEditCat.push(courseCatArr[i]);
//                 }
//             }
//         }
//         return res.status(200).json({

//         })
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             message: "Sorry! There was a server-side error",
//         });
//     }
// }

async function editCategory(req, res, next) {
    // const t = await sequelize.transaction();
    try {
        const { courseID } = req.params
        const { courseCategory } = req.body;

        if (!courseID || !courseCategory) {
            return res.status(404).json({
                message: "Invalid arguments"
            })
        }

        let parsed = JSON.parse(courseCategory);

        const courseData = await CourseModel.findByPk(courseID);

        if (!courseData || !courseData.courseCategory) {
            return res.status(404).json({
                message: "course not found"
            })
        }

        const courseCatArr = courseData.courseCategory.split(",");

        await CourseCategory.update(
            { isLinkedTo: 0 },
            {
                where: {
                    CourseCategoryID: courseCatArr,
                    isLinkedTo: 1
                }
            }
        );

        const categroie = await CourseCategory.findAll({
            where: {
                CategoryName: {
                    [Op.in]: parsed
                },
                isLinkedTo: {
                    [Op.gt]: 1
                }
            },
        });

        const ids = await categroie.map(course => course.dataValues.CategoryName);
        let leftOuts = [];
        let linkedIds = [];

        for (let i = 0; i < parsed.length; i++) {
            if (!ids.includes(parsed[i])) {
                leftOuts.push(parsed[i]);
            }
            else {
                linkedIds.push(parsed[i]);
            }
        }

        if (leftOuts.length > 0) {
            let pushedData = [];
            leftOuts.map((singleCatCreate) => {
                pushedData.push({ CategoryName: singleCatCreate });
            })
            await CourseCategory.bulkCreate(pushedData);
        }
        // Dual linking bug
        if (linkedIds.length > 0) {
            await CourseCategory.update(
                {
                    isLinkedTo: sequelize.literal(
                        "isLinkedTo + 1"
                    )
                },
                {
                    where: {
                        CourseCategoryID: { [Op.notIn]: courseCatArr },
                        CategoryName: linkedIds
                    }
                }
            )
        }
        next();

    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(401).json({
            message: "Error while creating Categories"
        })
    }
}
//! Edit Course Category ends here ----------------->>>>>>>>>>>>>>>>>>>

//! Delete Course files (Previous) starts here ----------------->>>>>>>>>>>>>>>>>>>

async function deletePrevious(req, res, next) {
    // const t = await sequelize.transaction();
    try {
        const { courseID } = req.params;
        const { deletedCourse, deletedModule } = req.body;
        if (deletedModule) {
            var deletetionArrayModule = await JSON.parse(deletedModule);
        }
        if (deletedCourse) {
            var deletionArrayCourse = await JSON.parse(deletedCourse);
        }
        //! Start
        if (deletionArrayCourse && deletionArrayCourse.length > 0) {
            await Promise.all(deletionArrayCourse.map(async (singleCourse) => {
                if (singleCourse.filesname) {
                    const isFor = await singleCourse.filesname.split("_")[0];
                    if (isFor == "CourseThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await CourseModel.update({ courseImage: null }, { where: { courseId: courseID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "CourseVideo") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                        await CourseModel.update({ courseVideo: null }, { where: { courseId: courseID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "CourseSubtitle") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                        await CourseModel.update({ courseSubtitle: null }, { where: { courseId: courseID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "CertificateThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await CourseModel.update({ certificateImage: null }, { where: { courseId: courseID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "TrophyThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await CourseModel.update({ trophyImage: null }, { where: { courseId: courseID } });
                        await fs.unlink(uploadDir + singleCourse.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    // await t.commit();
                }
            }))
        }

        // Module Array Deletions Starts
        if (deletetionArrayModule && deletetionArrayModule.length > 0) {
            await Promise.all(deletetionArrayModule.map(async (singleModule) => {
                if (singleModule.filesname) {
                    const isFor = await singleModule.filesname.split("_")[0];
                    if (isFor == "ModuleThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                        await Module.update({ moduleImage: null }, { where: { ModuleID: singleModule.id } });
                        await fs.unlink(uploadDir + singleModule.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "ModuleVideo") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                        await Module.update({ moduleVideo: null }, { where: { ModuleID: singleModule.id } });
                        await fs.unlink(uploadDir + singleModule.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    if (isFor == "ModuleSubtitle") {
                        const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                        await Module.update({ moduleSubtitle: null }, { where: { ModuleID: singleModule.id } });
                        await fs.unlink(uploadDir + singleModule.filesname, (err) => {
                            if (err) console.log(err);
                        })
                    }
                    // await t.commit();
                }
            }))
        }
        //! End
        next();
    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(401).json({
            message: "Error while Updating previous files"
        })
    }
}
//! Delete Course files (Previous) ends here ----------------->>>>>>>>>>>>>>>>>>>



module.exports = { editCourse, editCoursefiles, editCategory, deletePrevious };
const { Pathway, PathwayHistory, CourseCategory } = require('../models/index');
const fs = require('fs');
const path = require("path");

//! Delete Previous File

async function deletePreviousPathwayFiles(req, res, next) {
    // const t = await sequelize.transaction();
    try {
        const { PathwayID } = req.params;
        const { DeleteFiles } = req.body;
        if (!PathwayID) {
            return res.status(404).json({
                message: "Pathway not found"
            })
        }
        else {
            if (DeleteFiles) {
                const parsedDeletedFiles = await JSON.parse(DeleteFiles);
                if (parsedDeletedFiles && parsedDeletedFiles.length > 0) {
                    await Promise.all(parsedDeletedFiles.map(async (single) => {
                        const isFor = await single.split("_")[0];
                        if (isFor == "PathwayThumbnail") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                            await Pathway.update({ courseImage: null }, { where: { PathwayID: PathwayID } });
                            await fs.unlink(uploadDir + single, (err) => {
                                if (err) console.log(err);
                            })
                        }
                        if (isFor == "PathwayVideo") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Video/');
                            await Pathway.update({ courseVideo: null }, { where: { PathwayID: PathwayID } });
                            await fs.unlink(uploadDir + single, (err) => {
                                if (err) console.log(err);
                            })
                        }
                        if (isFor == "PathwaySubtitle") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                            await Pathway.update({ courseSubtitle: null }, { where: { PathwayID: PathwayID } });
                            await fs.unlink(uploadDir + single, (err) => {
                                if (err) console.log(err);
                            })
                        }
                        if (isFor == "CertificateThumbnail") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                            await Pathway.update({ certificateImage: null }, { where: { PathwayID: PathwayID } });
                            await fs.unlink(uploadDir + single, (err) => {
                                if (err) console.log(err);
                            })
                        }
                        if (isFor == "TrophyThumbnail") {
                            const uploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                            await Pathway.update({ trophyImage: null }, { where: { PathwayID: PathwayID } });
                            await fs.unlink(uploadDir + single, (err) => {
                                if (err) console.log(err);
                            })
                        }
                    }))
                }
            }
            // await t.commit();
            next();
        }

    } catch (error) {
        // await t.rollback();
        console.log(error);
        return res.status(500).json({
            message: "Error while deleting previous file"
        })
    }
}
//! Delete Previous File --Ends-->>

//! Find or create Pathway category

async function findorCreatePathwayCategory(req, res, next) {
    // const t = await sequelize.transaction();
    try {
        const { PathwayCategory } = req.body;
        await CourseCategory.findOrCreate({
            where: { CategoryName: PathwayCategory },
            defaults: {
                CategoryName: PathwayCategory,
            }
        }, );
        // await t.commit();
        next();
    } catch (error) {
        // await t.rollback();
        console.log(error);
        return res.status(500).json({
            message: "Invalid Category! Error while creating one"
        })
    }
}

//! Find or create Pathway Category --Ends-->>

//! Upload new file if any

async function uploadPathwayFiles(req, res, next) {
    try {
        if (req.files) {
            if (req.files.Thumbnail) {
                let thumbUploadDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                const imageFile = req.files.Thumbnail;
                const isArrayValidate = Array.isArray(imageFile);
                if (isArrayValidate == false) { // check for object
                    let imageReqArray = await imageFile.name.split("_");
                    const imgName = imageReqArray[0];
                    if (imgName == "PathwayThumbnail") {
                        req.PPt = imageFile.name;
                        await imageFile.mv(thumbUploadDir + imageFile.name);
                    }
                    if (imgName == "CertificateThumbnail") {
                        req.PCt = imageFile.name;
                        await imageFile.mv(thumbUploadDir + imageFile.name);
                    }
                    if (imgName == "TrophyThumbnail") {
                        req.PTt = imageFile.name;
                        await imageFile.mv(thumbUploadDir + imageFile.name);
                    }
                }
                if (isArrayValidate == true) { //check for array
                    await Promise.all(imageFile.map(async (single) => {
                        let imageReqArray = await single.name.split("_");
                        const imgName = imageReqArray[0];
                        if (imgName == "PathwayThumbnail") {
                            req.PPt = single.name;
                            await single.mv(thumbUploadDir + single.name);
                        }
                        if (imgName == "CertificateThumbnail") {
                            req.PCt = single.name;
                            await single.mv(thumbUploadDir + single.name);
                        }
                        if (imgName == "TrophyThumbnail") {
                            req.PTt = single.name;
                            await single.mv(thumbUploadDir + single.name);
                        }
                    }))
                }
            }
            if (req.files.Video) {
                let videoUploadDir = await path.join(__dirname, '..', '/volume/Video/');
                const videoFile = req.files.Video;
                let videoReqArray = await videoFile.name.split("_");
                const videoName = videoReqArray[0];
                if (videoName == "PathwayVideo") {
                    req.VTt = videoFile.name;
                    await videoFile.mv(videoUploadDir + videoFile.name);
                }
            }
            if (req.files.Subtitle) {
                let subtitleUploadDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                const subtitleFile = req.files.Subtitle;
                let subtitleReqArray = await subtitleFile.name.split("_");
                const subtitleName = subtitleReqArray[0];
                if (subtitleName == "PathwaySubtitle") {
                    req.STt = subtitleFile.name;
                    await subtitleFile.mv(subtitleUploadDir + subtitleFile.name);
                }
            }
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error encountered while uploading files"
        })
    }
}
//! Upload new file if any --Ends--->>

//! Create the updated Pathway

async function editPathway(req, res) {
    try {
        const { PathwayID } = req.params;
        const { PathwayTitle, PathwayTag, PathwayDescription, PathwayCategory, IsParentCatolog, CertificateTitle, Grade, TrophyTitle, Courses, Title, Tag, TrophyDescription, courseImage, courseVideo, courseSubtitle, certificateImage, trophyImage } = req.body;
        const { PPt, PCt, PTt, VTt, STt } = req; // PPt -> PathwayThumbnail , PCt -> PathwayCertificate , PTt -> PathwayTrophy, VTt -> Pathway Video, STt -> Pathway Subtitle
        const allCourseID = await CourseCategory.findOne({
            where: {
                CategoryName: PathwayCategory
            }
        })
        const ids = await allCourseID.CourseCategoryID;
        const stringedID = await ids.toString();

        //---patway history table-------------------------------------------//
        const PathwayIDWiseData = await Pathway.findOne({
            where: { PathwayID: PathwayID },
        });

        if (!PathwayIDWiseData) {
            return res
                .status(400)
                .send({
                    ErrorCode: "REQUEST",
                    message: "Pathway Data not found",
                });
        }
        const CreatePatwayHistoryData = await PathwayHistory.create(
            PathwayIDWiseData.dataValues, 
        );
        if (!CreatePatwayHistoryData) {
            return res
                .status(400)
                .send({
                    ErrorCode: "REQUEST",
                    message: "Pathway Data Not insert in History Table",
                });
        }
        //-------------------------------------------------------------------//
        await Pathway.update({
            PathwayTitle: PathwayTitle,
            PathwayTag: PathwayTag,
            PathwayCategory: stringedID,
            PathwayDescription: PathwayDescription,
            IsParentCatolog: IsParentCatolog,
            CertificateTitle: CertificateTitle,
            Grade: Grade,
            TrophyTitle: TrophyTitle,
            Courses: Courses,
            Title: Title,
            Tag: Tag,
            TrophyDescription: TrophyDescription,
            courseImage: PPt == undefined ? courseImage : PPt,
            courseVideo: VTt == undefined ? courseVideo : VTt,
            courseSubtitle: STt == undefined ? courseSubtitle : STt,
            certificateImage: PCt == undefined ? certificateImage : PCt,
            trophyImage: PTt == undefined ? trophyImage : PTt
        }, { where: { PathwayID: PathwayID } });
        // await t.commit();

        return res.status(200).json({
            message: "Pathway Updated Successfully"
        })
    } catch (error) {
        // await t.rollback();
        console.log(error);
        return res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

//! Create the updated Pathway --Ends-->>
module.exports = { deletePreviousPathwayFiles, findorCreatePathwayCategory, uploadPathwayFiles, editPathway };
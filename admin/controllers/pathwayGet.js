const { Pathway, PathwayHistory, CourseCategory } = require('../models/index');
const fs = require('fs');
const path = require("path");
const { Op } = require("sequelize");

async function getPathwayById(req, res) {
    try {
        const { PathwayID } = req.params;
        if (!PathwayID) {
            res.status(404).json({
                message: "Pathway not found"
            })
        }
        else {
            const pathwayByID = await Pathway.findByPk(PathwayID);

            if (!pathwayByID) {
                res.status(404).json({
                    message: "Pathway not found"
                })
            }
            else {
                const allPathwayCat = await pathwayByID.PathwayCategory.split(",");
                const pathwayCatDatas = await CourseCategory.findAll({
                    where: { CourseCategoryID: allPathwayCat }
                });
                res.status(200).json({
                    message: "Pathway data",
                    Data: pathwayByID,
                    allCat: pathwayCatDatas
                })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while fetching pathway data"
        })
    }
}

async function pathwayEdit(req, res) {
    try {
        const { PathwayID } = req.params;
        if (!PathwayID) {
            res.status(404).json({
                message: "Pathway not found"
            })
        }
        else {
            const pathwayByID = await Pathway.findByPk(PathwayID);
            if (!pathwayByID) {
                res.status(404).json({
                    message: "Pathway not found"
                })
            }
            else {
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
                    PathwayIDWiseData.dataValues
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

                // console.log(`is called`);
                let thumbnailDir = await path.join(__dirname, '..', '/volume/Thumbnail/');
                let videoDir = await path.join(__dirname, '..', '/volume/Video/');
                let subtitleDir = await path.join(__dirname, '..', '/volume/Subtitle/');
                const { PathwayTitle, PathwayTag, PathwayDescription, IsParentCatolog, CertificateTitle, Grade, TrophyTitle, Courses, Title, Tag, TrophyDescription } = req.body;
                await Pathway.update({
                    PathwayTitle: PathwayTitle,
                    PathwayTag: PathwayTag,
                    PathwayDescription: PathwayDescription,
                    IsParentCatolog: IsParentCatolog,
                    CertificateTitle: CertificateTitle,
                    Grade: Grade,
                    TrophyTitle: TrophyTitle,
                    Courses: Courses,
                    Title: Title,
                    Tag: Tag,
                    TrophyDescription: TrophyDescription,
                    // courseImage: IMG,
                    // courseVideo: VDO,
                    // certificateImage: CER,
                    // trophyImage: TRP
                }, { where: { PathwayID: PathwayID } });
                const { courseImage, courseVideo, certificateImage, trophyImage, courseSubtitle } = req.files;
                // if(courseImage){

                // }
                if (!courseImage) {
                    // console.log(`object`);
                    await Pathway.update({
                        courseImage: null
                    }, { where: { PathwayID: PathwayID } })
                    if (pathwayByID.courseImage) {
                        await fs.unlink(thumbnailDir + pathwayByID.courseImage, (err) => {
                            if (err) console.log(err);
                        });
                    }
                }
                if (courseImage) {
                    if (courseImage.name !== pathwayByID.courseImage) {
                        await fs.unlink(thumbnailDir + pathwayByID.courseImage, (err) => {
                            if (err) console.log(err);
                        })
                        await Pathway.update({
                            courseImage: courseImage.name
                        }, { where: { PathwayID: PathwayID } });
                        await courseImage.mv(thumbnailDir + courseImage.name);
                    }
                }
                if (!courseVideo) {
                    // console.log(`object`);
                    // console.log(pathwayByID.courseVideo);
                    await Pathway.update({
                        courseVideo: null
                    }, { where: { PathwayID: PathwayID } })
                    if (pathwayByID.courseVideo) {
                        await fs.unlink(videoDir + pathwayByID.courseVideo, (err) => {
                            if (err) console.log(err);
                        });
                    }

                }
                if (courseVideo) {
                    if (courseVideo.name !== pathwayByID.courseVideo) {
                        await fs.unlink(videoDir + pathwayByID.courseVideo, (err) => {
                            if (err) console.log(err);
                        })
                        await Pathway.update({
                            courseVideo: courseVideo.name
                        }, { where: { PathwayID: PathwayID } });
                        await courseVideo.mv(videoDir + courseVideo.name);
                    }
                }
                if (!certificateImage) {
                    await Pathway.update({
                        certificateImage: null
                    }, { where: { PathwayID: PathwayID } })
                    if (pathwayByID.certificateImage) {
                        await fs.unlink(thumbnailDir + pathwayByID.certificateImage, (err) => {
                            if (err) console.log(err);
                        });
                    }

                }
                if (certificateImage) {
                    if (certificateImage.name !== pathwayByID.certificateImage) {
                        await fs.unlink(thumbnailDir + pathwayByID.certificateImage, (err) => {
                            if (err) console.log(err);
                        })
                        await Pathway.update({
                            certificateImage: certificateImage.name
                        }, { where: { PathwayID: PathwayID } });
                        await certificateImage.mv(thumbnailDir + certificateImage.name);
                    }
                }
                if (!trophyImage) {
                    await Pathway.update({
                        trophyImage: null
                    }, { where: { PathwayID: PathwayID } })
                    await fs.unlink(thumbnailDir + pathwayByID.trophyImage, (err) => {
                        if (err) console.log(err);
                    });
                }
                if (trophyImage) {
                    if (trophyImage.name !== pathwayByID.trophyImage) {
                        await fs.unlink(thumbnailDir + pathwayByID.trophyImage, (err) => {
                            if (err) console.log(err);
                        })
                        await Pathway.update({
                            trophyImage: trophyImage.name
                        }, { where: { PathwayID: PathwayID } });
                        await trophyImage.mv(uploadDir + trophyImage.name);
                    }
                }
                if (!courseSubtitle) {
                    await Pathway.update({
                        courseSubtitle: null
                    }, { where: { PathwayID: PathwayID } })
                    await fs.unlink(subtitleDir + pathwayByID.courseSubtitle, (err) => {
                        if (err) console.log(err);
                    });
                }
                if (courseSubtitle) {
                    if (courseSubtitle.name !== pathwayByID.courseSubtitle) {
                        await fs.unlink(subtitleDir + pathwayByID.courseSubtitle, (err) => {
                            if (err) console.log(err);
                        })
                        await Pathway.update({
                            courseSubtitle: courseSubtitle.name
                        }, { where: { PathwayID: PathwayID } });
                        await courseSubtitle.mv(subtitleDir + courseSubtitle.name);
                    }
                }
                return res.status(200).json({
                    message: "Pathway Edited Successfully"
                })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while editing pathway data"
        })
    }
}

//! Pathway data by id (HTTP Request)
async function pathwayGetByIdHttp(req, res) {
    try {
        const { PathwayId } = req.query;
        if (!PathwayId) {
            return res.status(404).json({
                message: "Pathway not found"
            })
        }
        else {
            const pathwayData = await Pathway.findByPk(PathwayId);
            if (!pathwayData) {
                return res.status(404).json({
                    message: "Pathway not found"
                })
            }
            else {
                return res.status(200).json({
                    pathwayData: pathwayData
                })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while fetching pathway data"
        })
    }
}

async function getPathwayByIDs(req, res) {
    try {
        const { PathwayIDs } = req.query;
        if (!PathwayIDs) {
            return res.status(404).json({
                message: "No Pathway Found"
            })
        }
        else {
            const parsedIds = await JSON.parse(PathwayIDs);
            console.log(parsedIds);
            const pathwayData = await Pathway.findAll({
                where: {
                    PathwayID: { [Op.in]: parsedIds }
                }
            })
            return res.status(200).json({
                Data: pathwayData
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while fetching pathway data"
        })
    }
}

module.exports = { getPathwayById, pathwayEdit, pathwayGetByIdHttp, getPathwayByIDs };
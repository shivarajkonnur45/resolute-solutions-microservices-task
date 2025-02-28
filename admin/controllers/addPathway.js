const { Pathway, CourseCategory, sequelize } = require('../models/index');
const path = require("path");
const { Op } = require("sequelize");

async function addPathway(req, res) {
    // const t = await sequelize.transaction();
    try {
        const { PathwayTitle, PathwayTag, PathwayDescription, PathwayCategory, IsParentCatolog, CertificateTitle, Grade, TrophyTitle, Courses, Title, Tag, TrophyDescription } = req.body;
        // console.log(`->>>>>>>>>>>>>>>>>>`);
        // console.log(PathwayCategory);
        // console.log(`->>>>>>>>>>>>>>>>>>`);
        const { IMG, VDO, CER, TRP, SUB } = req;
        // let parsed = JSON.parse(PathwayCategory);
        const allCourseID = await CourseCategory.findOne({
            where: {
                CategoryName: PathwayCategory
            }
        })
        const ids = await allCourseID.CourseCategoryID;
        const stringedID = await ids.toString();

        await Pathway.create({
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
            courseImage: IMG,
            courseVideo: VDO,
            courseSubtitle: SUB,
            certificateImage: CER,
            trophyImage: TRP
        }, );
        // await t.commit();
        res.status(200).json({
            message: "Pathway Created"
        })
    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

async function uploadPathway(req, res, next) {
    try {
        let thumbnailUploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');
        let videoUploadDir = path.join(__dirname, '..', '/volume/Video/');
        let subtitleUploadDir = path.join(__dirname, '..', '/volume/Subtitle/');
        // console.log('<<<------------------');
        // console.log(uploadDir);
        // console.log('------------------->>>>>');
        if (req.files) {
            if (req.files.courseImage) {
                // console.log(req.files.courseImage);
                await req.files.courseImage.mv(`${thumbnailUploadDir}/${req.files.courseImage.name}`);
                req.IMG = req.files.courseImage.name;
            }
            if (req.files.courseVideo) {
                await req.files.courseVideo.mv(`${videoUploadDir}/${req.files.courseVideo.name}`);
                req.VDO = req.files.courseVideo.name;
            }
            if (req.files.courseSubtitle) {
                await req.files.courseSubtitle.mv(`${subtitleUploadDir}/${req.files.courseSubtitle.name}`);
                req.SUB = req.files.courseSubtitle.name;
            }
            if (req.files.certificateImage) {
                await req.files.certificateImage.mv(`${thumbnailUploadDir}/${req.files.certificateImage.name}`);
                req.CER = req.files.certificateImage.name;
            }
            if (req.files.trophyImage) {
                await req.files.trophyImage.mv(`${thumbnailUploadDir}/${req.files.trophyImage.name}`);
                req.TRP = req.files.trophyImage.name;
            }
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(402).json({
            message: "Error while uploading files"
        })
    }
}

async function CategorycheckPath(req, res, next) {
    // const t = await sequelize.transaction();
    try {
        const { PathwayCategory } = req.body;
        // console.log(PathwayCategory);
        // let parsed = JSON.parse(PathwayCategory);
        const categroie = await CourseCategory.findOne({
            where: {
                CategoryName: PathwayCategory
            },
        })
        if (!categroie) {
            await CourseCategory.create({ CategoryName: PathwayCategory }, );
            // await t.commit();
            next();
        }
        else {
            next();
        }
    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(401).json({
            message: "Error while creating Categories"
        })
    }
}

module.exports = { addPathway, uploadPathway, CategorycheckPath };
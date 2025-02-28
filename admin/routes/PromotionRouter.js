const router = require("express").Router();
const Joi = require("joi");
const path = require("path");
const fs = require("fs");

const { validateRequest } = require("../config/validate-request.js");
const validateAdminToken = require("../middleware/accountVerify.js");
const validate = require('../middleware/validate.js');
const validHttp = require("../middleware/httpRequest.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

const PromotionController = require("../controllers/PromotionController.js");

const PromotionController2 = require("../controllers/PromotionController2.js");


// router.post("/add-promotion", validateAdminToken, PromotionController.uploadPromotionFiles, PromotionController.AddRequest);
// router.post("/add-promotion2", validateAdminToken, PromotionController2.AddRequest);
// router.put("/update-promotion2/:id", validateAdminToken, PromotionController2.UpdateRequest);
//router.post("/upload", validateAdminToken, PromotionController2.upload_file);


router.get("/get-promotions", validateAdminToken, checkUserDeletion, PromotionController.GetPromotionsRequest);
router.get("/get-promotion/:id", validateAdminToken, checkUserDeletion, PromotionController.GetPromotionRequest);
router.put("/update-promotion/:id", validateAdminToken, checkUserDeletion, PromotionController.uploadPromotionFiles, PromotionController.UpdateRequest);

router.delete("/delete-promotion/:id", validateAdminToken, checkUserDeletion, PromotionController.DeleteRequest);
router.delete("/promotion/:PromotionID/promotion-module-delete/:ModuleID", validateAdminToken, checkUserDeletion, DeleteValidation, PromotionController.DeleteModuleRequest);

router.delete("/PromotionMod", validateAdminToken, checkUserDeletion, PromotionController.DeleteModule);
// HTTP REQUEST
router.get("/promotion/:id", validHttp, PromotionController.GetHttpPromotionRequest);
router.get("/promotions", validHttp, PromotionController.GetHttpPromotionsRequest);

async function uploadMiddleware(req, res, next) {
    if (req.files) {
        const newDir = await path.join(__dirname, '..', '/upload/');

        if (req.files.ImgFile) {
            const imgFile = req.files.ImgFile;
            const imgFilename = imgFile.name;
            await imgFile.mv(newDir + imgFilename);
            req.body.ImgFile = imgFilename;
        }

        if (req.files.VideoFile) {
            const videoFile = req.files.VideoFile;
            const videoFilename = videoFile.name;
            await videoFile.mv(newDir + videoFilename);
            req.body.VideoFile = videoFilename;
        }

        if (req.files.SubtitleFile) {
            const subtitleFile = req.files.SubtitleFile;
            const subtitleFilename = subtitleFile.name;
            await subtitleFile.mv(newDir + subtitleFilename);
            req.body.SubtitleFile = subtitleFilename;
        }
    };
    next();
};



// function AddValidation(req, res, next) {
//     const schema = Joi.object({
//         PromotionTitle: Joi.string().max(120).allow(null).optional().empty(''),
//         AccountType: Joi.string().max(120).valid('Company', 'Parent', 'Student').required(),
//         CTA: Joi.string().max(30).allow(null).optional().empty(''),
//         MembershipBannerTitle: Joi.string().max(120).allow(null).optional().empty(''),
//         MembershipBannerCTA: Joi.string().max(30).allow(null).optional().empty(''),
//         MembershipBannerTag: Joi.string().max(255).allow(null).optional().empty(''),
//         MembershipReferralTitle: Joi.string().max(120).allow(null).optional().empty(''),
//         MembershipReferralCTA: Joi.string().max(30).allow(null).optional().empty(''),
//         MembershipReferralTag: Joi.string().max(255).allow(null).optional().empty(''),
//         MembershipReferralDescription: Joi.string().max(255).allow(null).optional().empty(''),
//         ImgFile: Joi.string().allow(null).optional().empty(''),
//         VideoFile: Joi.string().allow(null).optional().empty(''),
//         SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         IsActive: Joi.number().integer().valid(0, 1).default(0),
//         PromotionCarousel: Joi.array().items(Joi.object({
//             Title: Joi.string().max(120).allow(null).optional().empty(''),
//             Description: Joi.string().max(300).allow(null).optional().empty(''),
//             CTA: Joi.string().max(255).allow(null).optional().empty(''),
//             ImgFile: Joi.string().allow(null).optional().empty(''),
//             VideoFile: Joi.string().allow(null).optional().empty(''),
//             SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         })),
//         PromotionVideo: Joi.array().items(Joi.object({
//             VideoColletionTitle: Joi.string().max(120).allow(null).optional().empty(''),
//             Title: Joi.string().max(120).allow(null).optional().empty(''),
//             Description: Joi.string().max(300).allow(null).optional().empty(''),
//             CTA: Joi.string().max(255).allow(null).optional().empty(''),
//             ImgFile: Joi.string().allow(null).optional().empty(''),
//             VideoFile: Joi.string().allow(null).optional().empty(''),
//             SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         })),
//         PromotionOnboardingVideo: Joi.array().items(Joi.object({
//             DeviceType: Joi.string().max(120).valid('Desktop', 'Tablet', 'Mobile').allow(null).optional().empty(''),
//             Title: Joi.string().max(120).allow(null).optional().empty(''),
//             Description: Joi.string().max(300).allow(null).optional().empty(''),
//             CTA: Joi.string().max(255).allow(null).optional().empty(''),
//             ImgFile: Joi.string().allow(null).optional().empty(''),
//             VideoFile: Joi.string().allow(null).optional().empty(''),
//             SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         })),

//     });

//     try {
//         if (req.files) {
//             const newDir = path.join(__dirname, '..', 'upload');
//             if (req.files.ImgFile) {
//                 const imgFile = req.files.ImgFile;
//                 const imgFilename = Date.now() + "_" + imgFile.name;
//                 imgFile.mv(path.join(newDir, imgFilename));
//                 // req.body.ImgFile = imgFilename;
//             }
//             if (req.files.VideoFile) {
//                 const videoFile = req.files.VideoFile;
//                 const videoFilename = Date.now() + "_" + videoFile.name;
//                 videoFile.mv(path.join(newDir, videoFilename));
//                 // req.body.VideoFile = videoFilename;
//             }
//             if (req.files.SubtitleFile) {
//                 const subtitleFile = req.files.SubtitleFile;
//                 const subtitleFilename = Date.now() + "_" + subtitleFile.name;
//                 subtitleFile.mv(path.join(newDir, subtitleFilename));
//                 // req.body.SubtitleFile = subtitleFilename;
//             }
//         }

//         validateRequest(req, res, next, schema);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Internal server error" });
//     }

// }
// function UpdateValidation(req, res, next) {
//     const schema = Joi.object({
//         PromotionTitle: Joi.string().max(120).allow(null).optional().empty(''),
//         AccountType: Joi.string().max(120).valid('Company', 'Parent', 'Student'),
//         CTA: Joi.string().max(30).allow(null).optional().empty(''),
//         MembershipBannerTitle: Joi.string().max(120).allow(null).optional().empty(''),
//         MembershipBannerCTA: Joi.string().max(30).allow(null).optional().empty(''),
//         MembershipBannerTag: Joi.string().max(255).allow(null).optional().empty(''),
//         MembershipReferralTitle: Joi.string().max(120).allow(null).optional().empty(''),
//         MembershipReferralCTA: Joi.string().max(30).allow(null).optional().empty(''),
//         MembershipReferralTag: Joi.string().max(255).allow(null).optional().empty(''),
//         MembershipReferralDescription: Joi.string().max(255).allow(null).optional().empty(''),
//         ImgFile: Joi.string().allow(null).optional().empty(''),
//         VideoFile: Joi.string().allow(null).optional().empty(''),
//         SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         IsActive: Joi.number().integer().valid(0, 1).default(0),
//         PromotionCarousel: Joi.array().items(Joi.object({
//             PromotionCarouselID: Joi.number().integer(),
//             Title: Joi.string().max(120).allow(null).optional().empty(''),
//             Description: Joi.string().max(300).allow(null).optional().empty(''),
//             CTA: Joi.string().max(255).allow(null).optional().empty(''),
//             PromotionCarouselFiles: Joi.array().items(Joi.string()).allow(null).optional().empty(''),
//             Status: Joi.number().integer().valid(0, 1).default(0),
//             ImgFile: Joi.string().allow(null).optional().empty(''),
//             VideoFile: Joi.string().allow(null).optional().empty(''),
//             SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         })),
//         PromotionVideo: Joi.array().items(Joi.object({
//             PromotionVideoID: Joi.number().integer(),
//             VideoColletionTitle: Joi.string().max(120).allow(null).optional().empty(''),
//             Title: Joi.string().max(120).allow(null).optional().empty(''),
//             Description: Joi.string().max(300).allow(null).optional().empty(''),
//             CTA: Joi.string().max(255).allow(null).optional().empty(''),
//             Status: Joi.number().integer().valid(0, 1).default(0),
//             ImgFile: Joi.string().allow(null).optional().empty(''),
//             VideoFile: Joi.string().allow(null).optional().empty(''),
//             SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         })),
//         PromotionOnboardingVideo: Joi.array().items(Joi.object({
//             PromotionOnboardingVideoID: Joi.number().integer(),
//             DeviceType: Joi.string().max(120).valid('Desktop', 'Tablet', 'Mobile').allow(null).optional().empty(''),
//             Title: Joi.string().max(120).allow(null).optional().empty(''),
//             Description: Joi.string().max(300).allow(null).optional().empty(''),
//             CTA: Joi.string().max(255).allow(null).optional().empty(''),
//             Status: Joi.number().integer().valid(0, 1).default(0),
//             ImgFile: Joi.string().allow(null).optional().empty(''),
//             VideoFile: Joi.string().allow(null).optional().empty(''),
//             SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         })),
//         DeleteFiles: Joi.array().items(Joi.object({
//             modulename: Joi.string().max(120).required(),
//             filesname: Joi.string().max(120).required(),
//             id: Joi.number().integer().required()
//         })),
//     });



//     try {
//         if (req.files) {
//             const newDir = path.join(__dirname, '..', 'upload');
//             if (req.files.ImgFile) {
//                 const imgFile = req.files.ImgFile;
//                 imgFile.mv(path.join(newDir, imgFile.name));
//                 // req.body.ImgFile = imgFile.name;
//             }
//             if (req.files.VideoFile) {
//                 const videoFile = req.files.VideoFile;
//                 videoFile.mv(path.join(newDir, videoFile.name));
//                 // req.body.VideoFile = videoFile.name;
//             }
//             if (req.files.SubtitleFile) {
//                 const subtitleFile = req.files.SubtitleFile;
//                 subtitleFile.mv(path.join(newDir, subtitleFile.name));
//                 // req.body.SubtitleFile = subtitleFile.name;
//             }
//         }

//         validateRequest(req, res, next, schema);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Internal server error" });
//     }
// }
function DeleteValidation(req, res, next) {
    const schema = Joi.object({
        modulename: Joi.string().max(120),
        filesname: Joi.string().max(120).allow(null).optional().empty(''),
    });
    validateRequest(req, res, next, schema);
}
module.exports = router;


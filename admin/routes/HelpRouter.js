const router = require("express").Router();
const Joi = require("joi");
const path = require("path");

const validate = require('../middleware/validate.js');
const { validateRequest } = require("../config/validate-request.js");
const validateAdminToken = require("../middleware/accountVerify.js");
const validateHTTP = require("../middleware/httpRequest.js");
const HelpController = require("../controllers/HelpController.js");
const distinctHelpCategory = require('../controllers/distinctHelpCategory.js');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

router.post("/add-help", validateAdminToken, checkUserDeletion, validate('helpSchema'), uploadMiddleware, HelpController.AddRequest);
router.get("/get-helps", validateAdminToken, checkUserDeletion, HelpController.GetHelpsRequest);
router.get("/get-helps-category", validateAdminToken, checkUserDeletion, HelpController.GetHelpCategoryRequest);
router.get("/get-help/:id", validateAdminToken, checkUserDeletion, HelpController.GetHelpRequest);
router.put("/update-help/:id", validateAdminToken, checkUserDeletion, validate('helpUpdateSchema'), uploadMiddleware, HelpController.UpdateRequest);
router.delete("/delete-help/:id", validateAdminToken, checkUserDeletion, HelpController.DeleteRequest);
router.get('/distinctCategory', validateAdminToken, checkUserDeletion, distinctHelpCategory);

// HTTP REQUEST 
router.get('/get-help-http/:id', validateHTTP, HelpController.GetHelpHttpRequest);
router.get('/get-helps-http', validateHTTP, HelpController.GetHelpsHttpRequest);
router.get('/get-helps-category-http/:categoryFor', validateHTTP, distinctHelpCategory);

async function uploadMiddleware(req, res, next) {
    if (req.files) {
        if (req.files.ImgFile) {
            const newThumPath = await path.join(__dirname, '..', '/volume/Thumbnail/');
            const imgFile = req.files.ImgFile;
            const imgFilename = imgFile.name;
            await imgFile.mv(newThumPath + imgFilename);
            req.body.ImgFile = imgFilename;
        }

        if (req.files.VideoFile) {
            const newVideoPath = await path.join(__dirname, '..', '/volume/Video/');
            const videoFile = req.files.VideoFile;
            const videoFilename = videoFile.name;
            await videoFile.mv(newVideoPath + videoFilename);
            req.body.VideoFile = videoFilename;
        }

        if (req.files.SubtitleFile) {
            const newSubtitlePath = await path.join(__dirname, '..', '/volume/Subtitle/');
            const subtitleFile = req.files.SubtitleFile;
            const subtitleFilename = subtitleFile.name;
            await subtitleFile.mv(newSubtitlePath + subtitleFilename);
            req.body.SubtitleFile = subtitleFilename;
        }
    };
    next();
};


// function AddValidation(req, res, next) {
//     const schema = Joi.object({
//         Title: Joi.string().max(95).allow(null),
//         AccountType: Joi.string().valid('Company', 'Parent').max(150).allow(null).optional().empty(''),
//         Description: Joi.string().max(512).allow(null),
//         Category: Joi.string().max(100).allow(null),
//         ImgFile: Joi.string().allow(null),
//         VideoFile: Joi.string().allow(null),
//         SubtitleFile: Joi.string().allow(null),
//         IsActive: Joi.string().allow(null).optional().empty('').valid("0", "1").default("0").empty(''),
//     });

//     if (req.files) {
//         const newDir = path.join(__dirname, '..', '/upload/');
//         if (req.files.ImgFile) {
//             const imgFile = req.files.ImgFile;
//             const imgFilename = imgFile.name;
//             imgFile.mv(newDir + imgFilename);
//             req.body.ImgFile = imgFilename;
//         }

//         if (req.files.VideoFile) {
//             const videoFile = req.files.VideoFile;
//             const videoFilename = videoFile.name;
//             videoFile.mv(newDir + videoFilename);
//             req.body.VideoFile = videoFilename;
//         }

//         if (req.files.SubtitleFile) {
//             const subtitleFile = req.files.SubtitleFile;
//             const subtitleFilename = subtitleFile.name;
//             subtitleFile.mv(newDir + subtitleFilename);
//             req.body.SubtitleFile = subtitleFilename;
//         }

//     }
//     validateRequest(req, res, next, schema);

// }

// function UpdateValidation(req, res, next) {
//     const schema = Joi.object({
//         Title: Joi.string().max(95).allow(null).optional().empty(''),
//         AccountType: Joi.string().valid('Company', 'Parent').max(150).allow(null).optional().empty(''),
//         Description: Joi.string().max(512).allow(null).optional().empty(''),
//         Category: Joi.string().max(100).allow(null).optional().empty(''),
//         ImgFile: Joi.string().allow(null).optional().empty(''),
//         VideoFile: Joi.string().allow(null).optional().empty(''),
//         SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         filesname: Joi.string().allow(null).optional().empty(''),
//         IsActive: Joi.number().integer().valid(0, 1).optional(),
//     });

//     if (req.files) {
//         const newDir = path.join(__dirname, '..', '/upload/');
//         if (req.files.ImgFile) {
//             const imgFile = req.files.ImgFile;
//             const imgFilename = imgFile.name;
//             imgFile.mv(newDir + imgFilename);
//             req.body.ImgFile = imgFilename;
//         }

//         if (req.files.VideoFile) {
//             const videoFile = req.files.VideoFile;
//             const videoFilename = videoFile.name;
//             videoFile.mv(newDir + videoFilename);
//             req.body.VideoFile = videoFilename;
//         }

//         if (req.files.SubtitleFile) {
//             const subtitleFile = req.files.SubtitleFile;
//             const subtitleFilename = subtitleFile.name;
//             subtitleFile.mv(newDir + subtitleFilename);
//             req.body.SubtitleFile = subtitleFilename;
//         }

//     }
//     validateRequest(req, res, next, schema);
// }







module.exports = router;

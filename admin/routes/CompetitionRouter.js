const router = require("express").Router();
const Joi = require("joi");
const path = require("path");

const { validateRequest } = require("../config/validate-request.js");
const validate = require("../middleware/validate")
const validateAdminToken = require("../middleware/accountVerify.js");
const validateHTTP = require("../middleware/httpRequest.js");
const CompetitionController = require("../controllers/CompetitionController.js");


router.post("/add-competition", validateAdminToken, validate('competitionSchema'), uploadMiddleware, CompetitionController.AddRequest);
router.get("/get-competitions", validateAdminToken, CompetitionController.GetCompetitionsRequest);
router.get("/get-competition/:id", validateAdminToken, CompetitionController.GetCompetitionRequest);
router.put("/update-competition/:id", validateAdminToken, validate('competitionUpdateSchema'), uploadMiddleware, CompetitionController.UpdateRequest);
router.delete("/delete-competition/:id", validateAdminToken, CompetitionController.DeleteRequest);

// HTTP REQUEST 

router.get('/competition/:id', validateHTTP, CompetitionController.GetCompetitionHttpRequest);
router.get('/competitions', validateHTTP, CompetitionController.GetCompetitionsHttpRequest); 
router.get('/submittedEvents', validateHTTP, CompetitionController.getSubmittedEvents);

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
//         Grade: Joi.string().allow(null).optional().empty(''),
//         Format: Joi.string().valid('In-person', 'Online').max(150).allow(null).optional().empty(''),
//         CompetitionTitle: Joi.string().max(150).allow(null).optional().empty(''),
//         CompetitionDescription: Joi.string().max(2000).allow(null).optional().empty(''),
//         CompetitionRequirements: Joi.string().max(2000).allow(null).optional().empty(''),
//         FirstPrize: Joi.string().max(150).allow(null).optional().empty(''),
//         SecondPrize: Joi.string().max(150).allow(null).optional().empty(''),
//         ThirdPrize: Joi.string().max(150).allow(null).optional().empty(''),
//         StartDate: Joi.string().allow(null).optional().empty(''),
//         EndDate: Joi.string().allow(null).optional().empty(''),
//         ImgFile: Joi.string().allow(null).optional().empty(''),
//         VideoFile: Joi.string().allow(null).optional().empty(''),
//         SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         IsActive: Joi.string().allow(null).optional().valid("0", "1").default("0").empty(''),
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
//         Grade: Joi.string().allow(null).optional().empty(''),
//         Format: Joi.string().valid('In-person', 'Online').max(150).allow(null).optional().empty(''),
//         CompetitionTitle: Joi.string().max(150).allow(null).optional().empty(''),
//         CompetitionDescription: Joi.string().max(2000).allow(null).optional().empty(''),
//         CompetitionRequirements: Joi.string().max(2000).allow(null).optional().empty(''),
//         FirstPrize: Joi.string().max(150).allow(null).optional().empty(''),
//         SecondPrize: Joi.string().max(150).allow(null).optional().empty(''),
//         ThirdPrize: Joi.string().max(150).allow(null).optional().empty(''),
//         StartDate: Joi.string().allow(null).optional().empty(''),
//         EndDate: Joi.string().allow(null).optional().empty(''),
//         ImgFile: Joi.string().allow(null).optional().empty(''),
//         VideoFile: Joi.string().allow(null).optional().empty(''),
//         SubtitleFile: Joi.string().allow(null).optional().empty(''),
//         filesname: Joi.string().allow(null).optional().empty(''),
//         IsActive: Joi.number().integer().valid(0, 1).default(0),

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

const router = require("express").Router();
const path = require("path");
const fs = require("fs");

const StudentController = require("../controllers/StudentController.js");
const validateAdminToken = require("../middleware/accountVerify.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

router.get("/students-get", validateAdminToken, checkUserDeletion, StudentController.GetStudentsRequest);
router.get("/student-get/:id", validateAdminToken, checkUserDeletion, StudentController.GetStudentRequest);
router.put("/student-update/:id", validateAdminToken, checkUserDeletion, StudentController.UpdateRequest);
router.get("/student-competition-get", validateAdminToken, checkUserDeletion, StudentController.GetStudentCompetitionRequest);
router.post("/student-competition-Participate-add", validateAdminToken, checkUserDeletion, FileUpload, StudentController.AddStudentCompetitionParticipateRequest);
router.get("/student-competition-Participate-get", validateAdminToken, checkUserDeletion, StudentController.GetStudentCompetitionParticipateRequest);
router.get("/student-competition-Participates-get", validateAdminToken, checkUserDeletion, StudentController.GetStudentCompetitionParticipatesRequest);

async function FileUpload(req, res, next) {
    try {
        if (req.files) {
            const newDir = path.join(__dirname, '..', 'upload');

            if (req.files.ImgFile) {
                const imgFile = req.files.ImgFile;
                const imgFilename = imgFile.name;
                imgFile.mv(path.join(newDir, imgFilename));
                req.body.ImgFile = imgFilename;
            }

            if (req.files.VideoFile) {
                const videoFile = req.files.VideoFile;
                const videoFilename = videoFile.name;
                videoFile.mv(path.join(newDir, videoFilename));
                req.body.VideoFile = videoFilename;
            }

            if (req.files.SubtitleFile) {
                const subtitleFile = req.files.SubtitleFile;
                const subtitleFilename = subtitleFile.name;
                subtitleFile.mv(path.join(newDir, subtitleFilename));
                req.body.SubtitleFile = subtitleFilename;
            }

            return (req, res, next, schema);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = router;
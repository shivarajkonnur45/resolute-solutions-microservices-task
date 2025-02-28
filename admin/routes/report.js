const router = require("express").Router();
const validateAdminToken = require("../middleware/accountVerify.js");
const ReportController = require("../controllers/ReportController.js");
const httpVerify = require("../middleware/httpRequest.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

router.get("/", validateAdminToken, checkUserDeletion, ReportController.get_report);
router.get("/reportHttp", httpVerify, ReportController.get_report);



module.exports = router;

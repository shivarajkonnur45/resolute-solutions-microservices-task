const router = require("express").Router();
const validateAdminToken = require("../middleware/accountVerify.js");
const DashboardController = require("../controllers/DashboardController.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

router.get("/", validateAdminToken, DashboardController.get_dashboard);



module.exports = router;

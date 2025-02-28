const router = require("express").Router();
const path = require("path");
const fs = require("fs");

const ParentController = require("../controllers/ParentController.js");
const validate = require('../middleware/validate.js');
const validateAdminToken = require("../middleware/accountVerify.js");
const validateHTTP = require("../middleware/httpRequest.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

// HTTP REQUEST

router.post("/", validateAdminToken, checkUserDeletion, validate('parentSchema'), ParentController.add_parent_http);
router.put("/:UserID", validateAdminToken, checkUserDeletion, validate('parentUpdateSchema'), ParentController.update_parent_http);
router.delete("/:UserID", validateAdminToken, checkUserDeletion, ParentController.delete_parent_http);
router.get("/:UserID", validateAdminToken, checkUserDeletion, ParentController.get_parent_http);


module.exports = router;
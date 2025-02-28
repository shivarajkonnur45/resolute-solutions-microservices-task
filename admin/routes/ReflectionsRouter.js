const router = require("express").Router();

const validateAdminToken = require("../middleware/accountVerify.js");
const validate = require('../middleware/validate.js');
const ReflectionsController = require("../controllers/ReflectionsController.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

router.post("/add-reflection", validateAdminToken, checkUserDeletion, validate('reflectionSchema'), ReflectionsController.AddRequest);
router.get("/get-reflections", validateAdminToken, checkUserDeletion, ReflectionsController.GetreflectionsRequest);
router.get("/get-reflection/:id", validateAdminToken, checkUserDeletion, ReflectionsController.GetreflectionRequest);
router.put("/update-reflection/:id", validateAdminToken, checkUserDeletion, validate('reflectionUpdateSchema'), ReflectionsController.UpdateRequest);
router.delete("/delete-reflection/:id", validateAdminToken, checkUserDeletion, ReflectionsController.DeleteRequest);

// HTTP ROUTE
router.get("/reflection", ReflectionsController.GetRandomReflection);

module.exports = router;
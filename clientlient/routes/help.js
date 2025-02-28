const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());

const helpControler =  require('../controllers/help');
const validateToken = require("../middleware/accountVerify.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

router.get('/', validateToken, checkUserDeletion, helpControler.get_help_list);
router.get('/category' , validateToken, checkUserDeletion, helpControler.get_help_category);
router.get('/:helpID', validateToken, checkUserDeletion, helpControler.get_help_detail);

module.exports = router;
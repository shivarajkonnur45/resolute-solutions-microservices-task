const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());

const promotionControler = require('../controllers/promotion');
const validateToken = require("../middleware/accountVerify.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');


router.get('/', validateToken, checkUserDeletion, promotionControler.get_promotion_list);
//router.get('/:EventID', validateToken, promotionControler.get_event_detail);

module.exports = router;
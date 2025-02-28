const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());

const path = require('path');
const eventControler = require('../controllers/event');
const validateToken = require("../middleware/accountVerify.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

//router.get('/', validateToken, eventControler.get_event_list);
router.get('/', validateToken, checkUserDeletion, eventControler.get_event_list);
router.get('/Event/:EventID', validateToken, checkUserDeletion, eventControler.get_event_detail);
router.post('/event_Submit_entry', validateToken, checkUserDeletion, uploadMiddleware, eventControler.event_Submit_entry_htttp);
// router.get('/get_submitted_events/aa', eventControler.get_submitted_events)
router.get('/get_submitted_events/aa', validateToken, checkUserDeletion, eventControler.get_submitted_list);



async function uploadMiddleware(req, res, next) {
    if (req.files) {
        if (req.files.ImgFile) {
            const newThumPath = await path.join(__dirname, '..', '/Thumbnail/');
            const imgFile = req.files.ImgFile;
            const imgFilename = imgFile.name;
            await imgFile.mv(newThumPath + imgFilename);
            req.body.ImgFile = imgFilename;
        }

    };
    next();
};


module.exports = router;
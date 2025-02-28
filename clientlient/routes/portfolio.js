const express = require('express');
const router = express.Router();

//! Testing
router.use(express.json());
// const portfolioControler = require('../controllers/portfolio');
const validateToken = require("../middleware/accountVerify.js");
const validate = require('../middleware/validate.js');
// const accountVerify = require('../middleware/accountVerify.js')
const { getImageText, calculateScore } = require('../controllers/portfolioOCR.js');
//const http_verify = require('../middleware/httpRequest.js');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');
const { uploadPortfolio, addPortfolio, getPortfolioUser, getPortfolioFiles, validatePortfolios, updateDataBaseScore, getPortfolioCompletionStudent, downloadPortfolioFileZip } = require('../controllers/portfolio.js');

// router.post('/', validateToken, portfolioControler.uploadPromotionFiles, portfolioControler.addportfolio);
// router.get('/', validateToken, checkUserDeletion, portfolioControler.get_portfolio);
router.post('/portfolioAdd', validateToken, checkUserDeletion, uploadPortfolio, addPortfolio);
router.get('/portfolioData', validateToken, checkUserDeletion, getPortfolioUser);
router.get('/portfolioDetail', validateToken, checkUserDeletion, getPortfolioFiles);
router.get('/portScore', validatePortfolios);
router.post('/updatePortfolioScore', updateDataBaseScore);
router.get("/portfolioStatus", validateToken, getPortfolioCompletionStudent);
router.get("/downloadZipPortfolios", validateToken, downloadPortfolioFileZip);

module.exports = router;
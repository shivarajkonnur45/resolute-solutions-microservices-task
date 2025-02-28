const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate.js');
const validateHTTP = require("../middleware/httpRequest.js");
const checkUserDeletion = require('../middleware/userDeletionCheck.js');


const validateAdminToken = require("../middleware/accountVerify.js");
const {
    add_company_http,
    update_company_http,
    delete_company_http,
    get_company_http,
} = require("../controllers/CompanyController.js");

// router.post('/', validate('companySchema'), validateAdminToken, add_company);
// router.put('/', validate('companySchema'), validateAdminToken, update_company);



// HTTP REQUEST
router.post('/', validateAdminToken, checkUserDeletion, add_company_http);
router.get("/companyById", validateAdminToken, checkUserDeletion, get_company_http);
router.put('/:UserID', validateAdminToken, checkUserDeletion, validate('companyUpdateSchema'), update_company_http);
router.delete('/:UserID', validateAdminToken, checkUserDeletion, delete_company_http);


module.exports = router;
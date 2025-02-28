const express = require('express');
const route = express.Router();

//! Testing
route.use(express.json());

//Controller exported
const { pathwayGetById } = require('../controllers/pathway');

//Middleware if any
const accountVerify = require('../middleware/accountVerify');
const checkUserDeletion = require('../middleware/userDeletionCheck.js');

//Routing with desired methods
route.get('/', accountVerify, checkUserDeletion, pathwayGetById);

// Export the route
module.exports = route;
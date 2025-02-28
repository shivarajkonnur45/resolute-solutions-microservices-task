const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const db = require('../models/index');
const Sequelize = require('sequelize');
const axios = require('axios');
// const { signUpSchema } = require('../eventer/validation');


const get_promotion_list = async (req, res) => {
    try {
        // const AccountType = req.query.AccountType;

        const { AccDetails } = req;

        const AccountType = AccDetails.AccountType;

        var url = process.env.HTTP_REQUEST_ADMIN + '/promotion/promotions/?AccountType=' + AccountType;
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`
            }
        });
        res.status(200).json(response.data)
    } catch (error) {
        res.status(500).json({
            message: "Sorry! there was server-side error",
            error: error.message
        })
    }
}

// const get_event_detail = async (req, res) => {
//     try {
//         const response = await axios.get(process.env.HTTP_REQUEST_ADMIN+'/competition/competition/'+req.params.EventID, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`
//             }
//         });
//         res.status(200).json(response.data)
//     } catch (error) {
//         res.status(500).json({
//             message: "Sorry! there was server-side error",
//             error : error.message
//         })
//     }
// }

module.exports = {
    get_promotion_list,
    //get_event_detail
}
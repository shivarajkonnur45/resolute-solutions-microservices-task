const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cryptoJS = require('crypto-js');
const db = require('../models/index');
const Sequelize = require('sequelize');
const axios = require('axios');
// const { signUpSchema } = require('../helper/validation');


const get_help_list = async (req, res) => {
    try {

        var url = process.env.HTTP_REQUEST_ADMIN + '/help/get-helps-http/?Search=2';
        if (req.AccDetails.AccountType != 2) {
            url = process.env.HTTP_REQUEST_ADMIN + '/help/get-helps-http/?Search=3';
        }

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

const get_help_detail = async (req, res) => {
    try {
        const response = await axios.get(process.env.HTTP_REQUEST_ADMIN + '/help/get-help-http/' + req.params.helpID, {
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

const get_help_category = async (req, res) => {
    try {
        var url = process.env.HTTP_REQUEST_ADMIN + '/help/get-helps-category-http/2';
        if (req.AccDetails.AccountType != 2) {
            url = process.env.HTTP_REQUEST_ADMIN + '/help/get-helps-category-http/3';
        }
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
module.exports = {
    get_help_list,
    get_help_detail,
    get_help_category
}
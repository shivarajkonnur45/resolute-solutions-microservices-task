const { techlog } = require('../middleware/sq_request_send.js');
const moment = require('moment-timezone');
require('dotenv').config();

const apiLog = async (req, res, next) => {
    try {


        const { method, url, body, headers } = req;

        const statusCode = res.statusCode;
        const requestBody = JSON.stringify(body || null).replace(/["]/g, '');
        const apiUrl = url.includes('/api/v1') ? url.split('/api/v1')[1] : url;

        let query;
        let params;
        if (req.query) {
            query = req.query;
        }
        if (req.params) {
            params = req.params;
        }

        // Get the current timestamp in IST
        const indianTimestamp = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

        const allData = { method, apiUrl, statusCode, requestBody, query, params, headers, indianTimestamp };
        // console.log("==============================");
        // console.log(allData);



        const MessageBody = {
            type: 'logApiCall',
            data: allData
        };

        await techlog(MessageBody);

        // next();

        next();

    } catch (error) {
        return res.status(400).send({
            message: error.message
        });
    }
};

module.exports = apiLog;
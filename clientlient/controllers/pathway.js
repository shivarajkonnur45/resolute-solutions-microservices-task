const axios = require('axios');
require('dotenv').config();

async function pathwayGetById(req, res) {
    try {
        const { PathwayId } = req.query;
        if (!PathwayId) {
            return res.status(404).json({
                message: "Pathway Not Found"
            })
        }
        else {
            const adminUrl = process.env.HTTP_REQUEST_ADMIN;
            const token = process.env.HTTP_REQUEST_SECRET_KEY;

            const respPathwayData = await axios.get(`${adminUrl}/pathwayGetHttp?PathwayId=${PathwayId}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            if (respPathwayData.data) {
                return res.status(200).json({
                    message: "Pathway Data",
                    pathwayData: respPathwayData.data.pathwayData
                })
            }
            else { 
                // Remove this else loop to check the actual error from axios
                return res.status(404).json({
                    message: "Pathway Not Found"
                })
            }
        }
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json({
                message: error.response.data.message
            })
        }
        else {
            res.status(500).json({
                message: "Something went wrong"
            })
        }
    }
}

module.exports = { pathwayGetById };
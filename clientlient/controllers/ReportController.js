const axios = require('axios');

const get_admin_report_http = async (req, res) => {
    try {
        const token = process.env.HTTP_REQUEST_SECRET_KEY;
        const { student, startDate, endDate, type } = req.query;

        let queryParams = [];
        if (type) queryParams.push(`type=${type}`);
        if (student) queryParams.push(`student=${student}`);
        if (startDate) queryParams.push(`startDate=${startDate}`);
        if (endDate) queryParams.push(`endDate=${endDate}`);

        const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

        const url = `${process.env.HTTP_REQUEST_ADMIN}/report/reportHttp${queryString}`;
        const response = await axios.get(url, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.data) {
            return res.status(500).json({
                message: "Report Not Found",
                Data: []
            });
        }

        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({
            message: "Report Not Found",
        });
        console.error(error);
    }
};
module.exports = {
    get_admin_report_http,

}
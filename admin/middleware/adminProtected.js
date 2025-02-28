const { admin } = require('../models/index');

async function checkAdmin(req, res, next) {
    try {
        const accDetails = req.AccDetails;
        // console.log(accDetails);
        // console.log(accDetails.AccountType);
        if (accDetails.AccountType !== "4") {
            res.status(403).json({
                message: "This is a protected route for Admin"
            })
        }
        else {
            const adminExist = await admin.findOne({ where: { Email: accDetails.Email, AccountType: "4" } });
            if (!adminExist) {
                res.status(404).json({
                    message: "Admin donot exist!"
                })
            }
            else {
                next();
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while validating Admin"
        })
    }
}

module.exports = checkAdmin;
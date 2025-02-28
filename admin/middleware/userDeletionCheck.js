const { admin } = require('../models/index');

async function checkUserDeletion(req, res, next) {
    try {
        const { AccDetails } = req;
       
        if (!AccDetails) {
            return res.status(404).json({
                message: "User not found! Login again"
            })
        }
        else {
            const userExists = await admin.findByPk(AccDetails.UserID);
            if (!userExists) {
                return res.status(401).json({
                    message: "User does not exist",
                    existStatus: 0
                })
            }
            else {
                const deletedUser = userExists.IsActive;
                if (deletedUser == 2) {
                    return res.status(401).json({
                        message: "User does not exist",
                        existStatus: 0
                    })
                }
                else {
                    next();
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "There was an error while validation! Login again"
        })
    }
}

module.exports = checkUserDeletion;
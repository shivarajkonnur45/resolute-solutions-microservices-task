
async function checkForValidRole(req, res, next, role) {
    try {
        const { AccDetails } = req;

        if (!AccDetails || !AccDetails.AccountType) {
            return res.status(400).json({
                message: "Invalid Token! Login Again"
            })
        }

        if (AccDetails.AccountType != role) {
            return res.status(401).json({
                message: "You do not have permission to access this route"
            })
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "You are not authorized to access this route"
        })
    }
}

module.exports = checkForValidRole;
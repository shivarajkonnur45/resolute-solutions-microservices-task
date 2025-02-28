
function checkForValidRole(role){
    return async function checkForValidRoleAsync(req, res, next) {
        try {
            const { AccDetails } = req;
            // console.log(role, AccDetails.AccountType);
    
            if (!AccDetails || !AccDetails.AccountType) {
                return res.status(400).json({
                    message: "Invalid Token! Login Again"
                })
            }
            // console.log(AccDetails.AccountType);
            const isRoleArr = Array.isArray(role);

            if(isRoleArr){
                if(!role.includes(AccDetails.AccountType)){
                    return res.status(401).json({
                        message: "You do not have permission to access this route"
                    })
                }
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
}

module.exports = checkForValidRole;
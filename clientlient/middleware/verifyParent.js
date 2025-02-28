async function checkIsParent(req,res,next){
    try {
        const {AccDetails} = req;
        if(!AccDetails){
            return res.status(401).json({
                message :"Error while Verifying! Login Again"
            })
        }
        else{
            if(AccDetails.AccountType != 3 || !AccDetails.AccountType){
                return res.status(401).json({
                    message:"Login with Parent Email & Password"
                })
            }
            else{
                next()
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Sorry! There was an server-side error"
        })
    }
}

module.exports = checkIsParent;
async function underMaintainace(req,res){
    try {
        res.status(500).json({
            message:"We Are Under Maintenance! Please CheckOut after Some Time"
        })
    } catch (error) {
        res.status(500).json({
            message:"We Are Under Maintenance! Please CheckOut after Some Time"
        })
    }
}

module.exports = underMaintainace;
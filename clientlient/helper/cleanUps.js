const db = require("../models/index");

async function cleanUpUser(id, req, res) {
    try {
        await db.useremail.destroy({
            where: {
                UserID: id
            },
        });
        await db.user.destroy({
            where: {
                UserID: id
            },
        });
        await db.FreeTrail.destroy({
            where: { UserID: id },
        });
        return { success: 1 }
    } catch (error) {
        console.log(error);
        return { success: 0 }
    }
}

module.exports = { cleanUpUser };
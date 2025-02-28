const { admin, staffAdmin } = require('../models/index');
const cryptoJS = require('crypto-js');
require('dotenv').config();

const parentAdd = async (req, res) => {
    // const t = await sequelize.transaction();
    try {
        const { AccDetails } = req;
        // console.log(AccDetails);
        if (AccDetails.AccountType !== "Admin") {
            return res.status(404).json({ message: "Login With Admin Email And Password." });
        }

        // console.log(req.body);
        const { FirstName, LastName, TeamOrCompanyName, TeamMember, Email, Password, PhoneNumber, AccountID, IsParticipateCompetitions, IsNoSuPeAchPoQu, IsNCourseExNewsProm, IsLookFeedback, AccountType, StaffPermission, ParentID, IsActive, Status } = req.body;

        const alreadyExistEmail = await admin.findOne({
            where: {
                Email: Email
            }
        });
        if (alreadyExistEmail) {
            res.status(401).json({
                message: "Email Allready Exist"
            })
        }
        else {
            try {
                const encryptEmail = await cryptoJS.AES.encrypt(Email, process.env.SECRET).toString();
                const encryptPassword = await cryptoJS.AES.encrypt(Password, process.env.SECRET).toString();

                const adminData = await admin.create({
                    FirstName, LastName, TeamOrCompanyName, TeamMember, Email: encryptEmail, Password: encryptPassword, PhoneNumber, AccountID, IsParticipateCompetitions, IsNoSuPeAchPoQu, IsNCourseExNewsProm, IsLookFeedback, AccountType: AccountType, StaffPermission, ParentID, IsActive, Status, CreatedBy: AccDetails.FirstName,
                    LastModifiedBy: AccDetails.FirstName,
                }, );

                await staffAdmin.create({ staffEmail: Email }, );
                // await t.commit();
                res.status(200).json({
                    message: "Parent add successfull",
                })
            } catch (error) {
                // await t.rollback();
                console.log(error);
                res.status(501).json({
                    message: "Error while securing Credentials"
                })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! Server side error"
        })
    }
}


const studentAdd = async (req, res, next) => {
    try {
        const { AccDetails } = req;
        // console.log(AccDetails);
        // if (AccDetails.AccountType !== "Parent") {
        //     return res.status(404).json({ message: "Login With Parent Email And Password." });
        // }
        const { FirstName, LastName, TeamOrCompanyName, TeamMember, Email, Password, PhoneNumber, AccountID, IsParticipateCompetitions, IsNoSuPeAchPoQu, IsNCourseExNewsProm, IsLookFeedback, AccountType, StaffPermission, ParentID, IsActive, Status } = req.body;

        const alreadyExistEmail = await admin.findOne({
            where: {
                Email: Email
            }
        });
        if (alreadyExistEmail) {
            next();
            res.status(401).json({
                message: "Email Allready Exist"
            })
        }
        else {
            try {
                const encryptEmail = await cryptoJS.AES.encrypt(Email, process.env.SECRET).toString();
                const encryptPassword = await cryptoJS.AES.encrypt(Password, process.env.SECRET).toString();
                next();
            } catch (error) {
                console.log(error);
                res.status(501).json({
                    message: "Error while securing Credentials"
                })
            }
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! Server side error"
        })
    }

}

const companyAdd = async (req, res) => {
    // const t = await sequelize.transaction();
    try {
        const { AccDetails } = req;
        // console.log(AccDetails);
        if (AccDetails.AccountType !== "Admin") {
            return res.status(404).json({ message: "Login With Admin Email And Password." });
        }
        const { FirstName, LastName, TeamOrCompanyName, TeamMember, Email, Password, PhoneNumber, AccountID, IsParticipateCompetitions, IsNoSuPeAchPoQu, IsNCourseExNewsProm, IsLookFeedback, AccountType, StaffPermission, ParentID, IsActive, Status } = req.body;

        const alreadyExistEmail = await admin.findOne({
            where: {
                Email: Email
            }
        });
        if (alreadyExistEmail) {
            res.status(401).json({
                message: "Email Allready Exist"
            })
        }
        else {
            try {
                const encryptEmail = await cryptoJS.AES.encrypt(Email, process.env.SECRET).toString();
                const encryptPassword = await cryptoJS.AES.encrypt(Password, process.env.SECRET).toString();

                const adminData = await admin.create({
                    FirstName, LastName, TeamOrCompanyName, TeamMember, Email: encryptEmail, Password: encryptPassword, PhoneNumber, AccountID, IsParticipateCompetitions, IsNoSuPeAchPoQu, IsNCourseExNewsProm, IsLookFeedback, AccountType: AccountType, StaffPermission, ParentID, IsActive, Status, CreatedBy: AccDetails.FirstName,
                    LastModifiedBy: AccDetails.FirstName,
                }, );

                await staffAdmin.create({ staffEmail: Email }, );
                // await t.commit();
                res.status(200).json({
                    message: "Company add successfull"
                })
            } catch (error) {
                // await t.rollback();
                console.log(error);
                res.status(501).json({
                    message: "Error while securing Credentials"
                })
            }
        }

    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(500).json({
            message: "Sorry! Server side error"
        })
    }
}

module.exports = {
    parentAdd, studentAdd, companyAdd
};

const { admin } = require('../models/index');
const axios = require('axios');
const { Op, where } = require('sequelize');
require("dotenv").config();

async function mergeUser(req, res) {
    try {
        const { AccountType } = req.query;
        const { isActive } = req.query;
        const { Search } = req.query;
        const { status } = req.query;
        const Page = req.query.Page ? req.query.Page : 1;
        // console.log(req.query)
     
        let pageSize = 5; 
        const offset = (parseInt(Page) - 1) * pageSize; 
       
        const urlClient = process.env.HTTP_REQUEST_CLIENTLIENT;
        const token = process.env.HTTP_REQUEST_SECRET_KEY;

        const whereCondition = {};
        if (AccountType) {
            if (AccountType == 4) {
                whereCondition[Op.or] = [
                    { AccountType: { [Op.eq]: "4" } },
                    { AccountType: { [Op.eq]: "5" } }
                ];
            }
            else {
                whereCondition.AccountType = AccountType;
            }
        }
        if (isActive) {
            whereCondition.isActive = isActive;
        }
        if (Search) {
            whereCondition[Op.or] = [
                { uniqueID: { [Op.like]: `%${Search}%` } },
                { FirstName: { [Op.like]: `%${Search}%` } },
                { LastName: { [Op.like]: `%${Search}%` } }
            ];
        }

        if (!AccountType && !isActive && !Search) {
            const allData = await admin.findAll({
                where: { isActive: { [Op.ne]: "2" } },
                offset: offset,
                limit: pageSize
            });
            const {count} = await admin.findAndCountAll({
                where: { isActive: { [Op.ne]: "2" } },
            });

            // console.log(`Admin count`, count);
            const httpAllData = await axios.get(`${urlClient}/profile/get-users?Page=${Page}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            const useFulHttp = httpAllData.data.Data;
            const usrLen = httpAllData.data.usrLen;
            const stuLen = httpAllData.data.stuLen;
            if (useFulHttp.length > 0) {
                await Promise.all(await useFulHttp.map(async (singleHttp) => {
                    await allData.push(singleHttp);
                }));
            }
            const totalCount = count + usrLen;
            return res.status(200).json({
                message: "Account Data",
                Data: allData,
                usrCount: totalCount,
                stuCount: stuLen
            })
        }
        else {
            const allAdminSideData = await admin.findAll({
                where: whereCondition,isActive: { [Op.ne]: "2" },
                offset: offset,
                limit: pageSize
            });
            const {count} = await admin.findAndCountAll({
                where: whereCondition,isActive: { [Op.ne]: "2" },
            });

            const httpUserData = await axios.get(`${urlClient}/profile/get-users?AccountType=${AccountType}&isActive=${isActive}&Search=${Search}&Page=${Page}&status=${status}`, {
                headers: { "Authorization": "Bearer " + token }
            });
            const useFullHttp = httpUserData.data.Data;
            const usrLen = httpUserData.data.usrLen;
            const stuLen = httpUserData.data.stuLen;
            
            if (useFullHttp.length > 0) {
                await Promise.all(await useFullHttp.map(async (singleHttp) => {
                    await allAdminSideData.push(singleHttp);
                }));
            }

            const totalCount = count + usrLen;
            
            return res.status(200).json({
                Data: allAdminSideData,
                usrCount: totalCount,
                stuCount: stuLen
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while fetching users data"
        })
    }
}

module.exports = mergeUser;
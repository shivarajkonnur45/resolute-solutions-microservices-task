const { reflection, reflectionhistory } = require("../models/index");
const Sequelize = require('sequelize');
const sequelize = require('sequelize');
const { Op } = require("sequelize");

const AddRequest = async (req, res) => {
    try {
        const result = req.body;
        const { AccDetails } = req;

        const createdReflectionData = await reflection.create({
            Author: result.Author ?? undefined,
            Quote: result.Quote ?? undefined,
            CreatedBy: AccDetails.FirstName,
            LastModifiedBy: AccDetails.FirstName,
        });

        if (createdReflectionData) {
            return res.status(200).json({
                Message: "Reflection information added successfully!"
            });
        }
    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};

const GetreflectionsRequest = async (req, res) => {
    try {
        let { page, pageSize, Search } = req.query;
        page = page ? parseInt(page, 10) : 1;
        pageSize = pageSize ? parseInt(pageSize, 10) : 10;
        pageSize = pageSize <= 100 ? pageSize : 10;

        const whereCondition = {};
        if (Search) {
            whereCondition[Sequelize.Op.or] = [
                { Author: { [Sequelize.Op.like]: `%${Search}%` } },
                { Quote: { [Sequelize.Op.like]: `%${Search}%` } },
            ];
        }

        whereCondition.IsActive = { [Op.in]: ["0", "1"] };

        const { count, rows } = await reflection.findAndCountAll({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            where: whereCondition,
            IsActive: { $ne: "2" },
            order: [
                ['ReflectionID', 'ASC']
            ]
        });

        if (rows !== null) {
            return res.status(200).json({
                TotalCount: count,
                page: page,
                pageSize: pageSize,
                Data: rows
            });
        } else {
            return res.status(400).json({ Data: "Reflection Data Not Gets!" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};


const GetreflectionRequest = async (req, res) => {
    try {
        const id = req.params.id;

        const whereCondition = {};
        whereCondition.ReflectionID = id;
        whereCondition.IsActive = { [Sequelize.Op.in]: ["0", "1"] };

        const GetReflectionData = await reflection.findOne({
            where: whereCondition
        });
        if (GetReflectionData) {
            return res.status(200).json({
                TotalCount: GetReflectionData.length,
                Data: GetReflectionData
            });
        } else {
            return res.status(400).json({ Data: "Reflection Data Not Gets!" });
        }
    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};
const UpdateRequest = async (req, res) => {
    try {
        const { AccDetails } = req;
        const id = req.params.id;
        const result = req.body;
        const GetReflectionData = await reflection.findOne({ where: { ReflectionID: id } });
        if (!GetReflectionData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Reflection Data not found" });
        };

        const CreateReflectionHistoryData = await reflectionhistory.create(GetReflectionData.dataValues);
        if (!CreateReflectionHistoryData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Reflection Data Not insert in History Table" });
        };

        const UpdateReflectionData = await reflection.update(
            {
                Author: result.Author ?? undefined,
                Quote: result.Quote ?? undefined,
                IsActive: result.IsActive ?? undefined,
                // CreatedBy: AccDetails.FirstName,
                LastModifiedBy: AccDetails.FirstName,
            },
            { where: { ReflectionID: id } }
        );
        if (!UpdateReflectionData) {
            return res.status(200).json({
                Message: "Reflection information Not Update!",
            });
        }
        return res.status(200).json({
            Message: "Reflection information Update successfully!",
        });
    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};
const DeleteRequest = async (req, res) => {
    try {

        const id = req.params.id;
        const GetReflectionData = await reflection.findOne({ where: { ReflectionID: id } });
        if (!GetReflectionData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Reflection Data not found" });
        };
        const CreateReflectionHistoryData = await reflectionhistory.create(GetReflectionData.dataValues);
        if (!CreateReflectionHistoryData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Reflection Data Not insert in History Table" });
        };

        const DeleteReflectionData = await reflection.update(
            {
                IsActive: "2"
            },
            { where: { ReflectionID: id } }
        );
        res.status(200).json({
            message: "Reflection Data deleted successfully"
        })


        if (!DeleteReflectionData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Reflection Data Not deleted" });
        };
        res.status(201).json({ message: "Data Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// HTTP REQUEST
const GetRandomReflection = async (req, res) => {
    try {
        const whereCondition = {};
        whereCondition.IsActive = { [Op.in]: ["0", "1"] };

        const GetRandomReflectionData = await reflection.findOne({
            where: whereCondition,
            order: sequelize.literal('RAND()'),
        });

        if (GetRandomReflectionData) {
            return res.status(200).json({
                TotalCount: 1,
                Data: GetRandomReflectionData
            });
        } else {
            return res.status(206).json({ Data: "Reflection Data Not Found!" });
        }
    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};


module.exports = { GetRandomReflection, AddRequest, GetreflectionsRequest, GetreflectionRequest, UpdateRequest, DeleteRequest };
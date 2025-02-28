const { CourseCategory } = require('../models/index');
const { Op } = require('sequelize');

async function getAllCategories(req, res) {
    try {
        const allCategories = await CourseCategory.findAll({
            where: {
                isLinkedTo: { [Op.gte]: 1 }
            }
        });
        return res.status(200).json({
            message: "OK",
            allCategories: allCategories
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while fetching categories"
        })
    }
}

module.exports = getAllCategories;
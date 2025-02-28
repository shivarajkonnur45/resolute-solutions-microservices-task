const { help, Sequelize } = require('../models/index');

async function getDistinctCategory(req, res) {
    try {
        const { categoryFor } = req.params;
        // console.log(categoryFor);
        const allistinctCategory = await help.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('Category')), 'Category']
            ],
            where: { AccountType: categoryFor }
        })
        res.status(200).json({
            message: "Unique Categories",
            Categories: allistinctCategory,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error while fetching category"
        })
    }
}

module.exports = getDistinctCategory;
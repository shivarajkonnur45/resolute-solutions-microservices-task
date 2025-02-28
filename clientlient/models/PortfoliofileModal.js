module.exports = (sequelize, DataTypes) => {
    const portfoliofile = sequelize.define("PortfolioFile", {
        PortfolioFileID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        StudentID: {
            type: DataTypes.INTEGER,
        },
        PortfolioID: {
            type: DataTypes.INTEGER,
        },
        Filename: {
            type: DataTypes.STRING,
        }
    },
        {
            timestamps: false,
            tableName: "PortfolioFile",
        }
    );
    return portfoliofile;
};

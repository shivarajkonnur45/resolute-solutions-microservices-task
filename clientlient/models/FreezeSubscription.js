module.exports = (sequelize, DataTypes) => {
    const freezeSub = sequelize.define("freezeSub", {
        freezeSubId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdBy:{
            type: DataTypes.STRING
        },
        createdOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        lastModifiedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
        {
            timestamps: false,
            tableName: "freezeSub",
        }
    );
    return freezeSub;
};
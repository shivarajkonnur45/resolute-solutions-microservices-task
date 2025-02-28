module.exports = (sequelize, DataTypes) => {
    const reflectionhistory = sequelize.define("reflectionhistory", {
        ReflectionHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ReflectionID: {
            type: DataTypes.INTEGER,
        },
        Author: {
            type: DataTypes.STRING,
        },
        Quote: {
            type: DataTypes.TEXT('long'),
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2']),
            default: '0'
        },
        CreatedBy: {
            type: DataTypes.STRING,
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        LastModifiedBy: {
            type: DataTypes.STRING,
        },
        LastModifiedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
        {
            timestamps: false,
            tableName: "reflectionhistory",
        }
    );
    return reflectionhistory;
};

module.exports = (sequelize, DataTypes) => {
    const reflection = sequelize.define("reflection", {
        ReflectionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Author: {
            type: DataTypes.STRING,
        },
        Quote: {
            type: DataTypes.TEXT('long'),
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2']),
            defaultValue: '1',
            comment:"0 is InActive, 1 is Active, 2 is deleted"
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
            tableName: "reflection",
        }
    );
    return reflection;
};

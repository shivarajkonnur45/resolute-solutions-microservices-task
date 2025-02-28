module.exports = (sequelize, DataTypes) => {
    const FreeTrail = sequelize.define("FreeTrail", {
        freeTrialID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER
        },
        freeTrialStartDate:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        freeTrialLeft:{
            type: DataTypes.INTEGER,
            defaultValue: 14,
            comment:"0: Completed , 1-14: Days left"
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
        }
    },
    {
        timestamps: false,
        tableName: "FreeTrail",
    });
    return FreeTrail;
};

module.exports = (sequelize, DataTypes) => {
    const resetPassword = sequelize.define("resetPassword", {
        resetPasswordId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userUniqueId:{
            type:DataTypes.STRING,
            allowNull:false
        },
        userEmail:{
            type:DataTypes.STRING,
            allowNull:false
        },
        randomValidator:{
            type:DataTypes.CHAR(64),
            allowNull:false
        },
        createdBy:{
            type:DataTypes.STRING,
            allowNull:false
        },
        createdOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
        {
            timestamps: false,
            tableName: "resetPassword",
        }
    );
    return resetPassword;
};
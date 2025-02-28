module.exports = (sequelize, DataTypes) => {
    const OTP = sequelize.define("OTP", {
        OtpID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        otpUser:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        isNotUsed: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: '0: Used, 1: Not Used',
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        newGeneratedOn:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
        {
            timestamps: false,
            tableName: "OTP",
        }
    );
    return OTP;
};
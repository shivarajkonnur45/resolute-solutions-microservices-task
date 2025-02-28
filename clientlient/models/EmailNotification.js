module.exports = (sequelize, DataTypes) => {
    const emailnotification = sequelize.define("emailnotification", {
        emailnotificationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        notificationTitle: {
            type: DataTypes.STRING
        },
        notificationBody: {
            type: DataTypes.STRING
        },
        createdTime: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
        {
            timestamps: false,
            tableName: "emailnotification",
        }
    );
    return emailnotification;
};
module.exports = (sequelize, DataTypes) => {
    const visualnotification = sequelize.define("visualnotification", {
        notificationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        notificationTitle: {
            type: DataTypes.STRING
        },
        notificationBody: {
            type: DataTypes.STRING
        },
        notificationType: {
            type: DataTypes.STRING
        },
        deviceToken:{
            type: DataTypes.TEXT('long')
        },
        isSeen: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '0: Not Seen, 1: Seen',
        },
        isSeenTime: {
            type: DataTypes.DATE,
        },
        createdTime: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
        {
            timestamps: false,
            tableName: "visualnotification",
        }
    );
    return visualnotification;
};
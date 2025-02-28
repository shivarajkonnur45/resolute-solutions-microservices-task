module.exports = (sequelize, DataTypes) => {
    const clientachievement = sequelize.define("clientachievement", {
        achievementId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER,
            references: {
                model: "user",
                key: "UserID"
            },
            allowNull: false
        },
        CourseID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        courseTitle:{
            type: DataTypes.STRING
        },
        LessonID: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        badgeDesc: {
            type: DataTypes.JSON
        },
        trophyTitle:{
            type: DataTypes.STRING
        },
        trophyImage: {
            type: DataTypes.STRING
        },
        lessonBadgeCount: {
            type: DataTypes.INTEGER
        },
        totalBadgeCount: {
            type: DataTypes.INTEGER
        }
    },
        {
            timestamps: false,
            tableName: "clientachievement",
        }
    );
    return clientachievement;
};
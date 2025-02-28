module.exports = (sequelize, DataTypes) => {
    const clientachievementCourse = sequelize.define("clientachievementCourse", {
        achievementCourseId: {
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
        certificateBuffer:{
            type: DataTypes.BLOB('long')
        },
        certificateImage: {
            type: DataTypes.STRING
        }
    },
        {
            timestamps: false,
            tableName: "clientachievementCourse",
        }
    );
    return clientachievementCourse;
};
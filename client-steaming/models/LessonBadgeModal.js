module.exports = (sequelize, DataTypes) => {
    const lessonbadge = sequelize.define("lessonbadge", {
        LessonBadgeID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER,
        },
        LessonID: {
            type: DataTypes.INTEGER,
        },
        ModuleID: {
            type: DataTypes.INTEGER,
        },
        CourseID: {
            type: DataTypes.INTEGER,
        },
        Title: {
            type: DataTypes.STRING,
        },
        Description: {
            type: DataTypes.STRING,
        },
        LessonBadgeImage:{
            type: DataTypes.STRING
        }
    },
        {
            timestamps: false,
            tableName: "lessonbadge",
        }
    );
    return lessonbadge;
};

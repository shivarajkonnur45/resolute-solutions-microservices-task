module.exports = (sequelize, DataTypes) => {
    const lessonbadgeHistory = sequelize.define("lessonbadgeHistory", {
        LessonBadgeHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        LessonBadgeID: {
            type: DataTypes.INTEGER,

        },
        LessonID: {
            type: DataTypes.INTEGER,
        },
        ModuleID: {
            type: DataTypes.INTEGER,
        },
        courseId: {
            type: DataTypes.INTEGER,
        },
        Title: {
            type: DataTypes.STRING,
        },
        Description: {
            type: DataTypes.STRING,
        },
        LessonBadgeImage: {
            type: DataTypes.STRING
        },
        isActive: {
            type: DataTypes.ENUM("0", "1", "2"),
            defaultValue: "1",
            comment: "0: InActive, 1: Active, 2: Deleted"
        }
    },
        {
            timestamps: false,
            tableName: "lessonbadgeHistory",
        }
    );
    return lessonbadgeHistory;
};

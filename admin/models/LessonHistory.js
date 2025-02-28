module.exports = (sequelize, DataTypes) => {
    const LessonHistory = sequelize.define("LessonHistory", {
        LessonHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        LessonID: {
            type: DataTypes.INTEGER,
        },
        lessonTitle: {
            type: DataTypes.STRING
        },
        lessonDesc: {
            type: DataTypes.STRING
        },
        lessonImage: {
            type: DataTypes.STRING
        },
        lessonVideo: {
            type: DataTypes.STRING
        },
        lessonSubtitle: {
            type: DataTypes.STRING
        },
        courseId: {
            type: DataTypes.INTEGER
        },
        moduleId: {
            type: DataTypes.INTEGER
        },
        isActive: {
            type: DataTypes.ENUM("0", "1", "2"),
            defaultValue: "1",
            comment: "0: InActive, 1: Active, 2: Deleted"
        }
    },
        {
            timestamps: false,
            tableName: "LessonHistory",
        }
    );
    return LessonHistory;
};

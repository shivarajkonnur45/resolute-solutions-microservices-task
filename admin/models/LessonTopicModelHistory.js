module.exports = (sequelize, DataTypes) => {
    const lessontopicHistory = sequelize.define("lessontopicHistory", {
        LessonTopicHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        LessonTopicID: {
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
        Transcript: {
            type: DataTypes.TEXT,
        },
        TopicImgFile: {
            type: DataTypes.STRING,
        },
        isActive: {
            type: DataTypes.ENUM("0", "1", "2"),
            defaultValue: "1",
            comment: "0: InActive, 1: Active, 2: Deleted"
        }
    },
        {
            timestamps: false,
            tableName: "lessontopicHistory",
        }
    );
    return lessontopicHistory;
};

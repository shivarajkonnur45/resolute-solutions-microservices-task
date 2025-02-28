module.exports = (sequelize, DataTypes) => {
    const Lesson = sequelize.define("Lesson", {
        LessonID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        lessonVideoDuration: {
            type: DataTypes.INTEGER
        },
        lessonSubtitle: {
            type: DataTypes.STRING
        },
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        moduleId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isActive: {
            type: DataTypes.ENUM("0", "1", "2"),
            defaultValue: "1",
            comment: "0: InActive, 1: Active, 2: Deleted"
        }
    },
        {
            timestamps: false,
            tableName: "Lesson",
        }
    );
    return Lesson;
};

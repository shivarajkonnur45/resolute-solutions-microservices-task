module.exports = (sequelize, DataTypes) => {
    const flowlesson = sequelize.define("flowlesson", {
        LessonID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        FlowID: {
            type: DataTypes.INTEGER,
        },
        Grade: {
            type: DataTypes.STRING,
        },
        StudentID: {
            type: DataTypes.INTEGER,
        },
        courseId: {
            type: DataTypes.INTEGER
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
    },
        {
            timestamps: false,
            tableName: "flowlesson",

        }
    );
    return flowlesson;
};

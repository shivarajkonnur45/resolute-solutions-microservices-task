module.exports = (sequelize, DataTypes) => {
    const CourseVideo = sequelize.define("CourseVideo", {
        CourseVideoID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER,
        },
        CourseID: {
            type: DataTypes.INTEGER,
        },
        ModuleID: {
            type: DataTypes.INTEGER,
        },
        LessonID: {
            type: DataTypes.INTEGER,
        },
        VideoName: {
            type: DataTypes.STRING,
            // allowNull: false
        },
        LatestBufferTime: {
            type: DataTypes.STRING,
        },
        HightestBufferTime: {
            type: DataTypes.STRING,
        },
        VideoLength: {
            type: DataTypes.STRING,
        },
        userProgress: {
            type: DataTypes.STRING,
        },
        Status: {
            type: DataTypes.INTEGER,
            comment: '0 - Not completed, 1 - completed'
        },
        quizScore:{
            type: DataTypes.STRING,
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
        {
            timestamps: false,
            tableName: "CourseVideo",
        }
    );
    return CourseVideo;
};
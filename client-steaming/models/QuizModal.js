module.exports = (sequelize, DataTypes) => {
    const LessonQuiz = sequelize.define("LessonQuiz", {
        LessonQuizID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
        RightAnswer: {
            type: DataTypes.INTEGER,
        },
        QuizFormat: {
            type: DataTypes.STRING,
        },
        Question: {
            type: DataTypes.STRING,
        },
        Answers: {
            type: DataTypes.STRING,
        },
        Position: {
            type: DataTypes.INTEGER,
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
        {
            timestamps: false,
            tableName: "LessonQuiz",
        }
    );
    return LessonQuiz;
};

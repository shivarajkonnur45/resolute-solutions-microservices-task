module.exports = (sequelize, DataTypes) => {
    const lessonquizHistory = sequelize.define("lessonquizHistory", {
        LessonQuizHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        LessonQuizID: {
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
        RightAnswer: {
            type: DataTypes.STRING,
        },
        QuizFormat: {
            type: DataTypes.STRING,
        },
        Question: {
            type: DataTypes.STRING,
        },
        // QuestionFile: {
        //     type: DataTypes.JSON,
        // },
        Answers: {
            type: DataTypes.JSON,
        },
        Position: {
            type: DataTypes.INTEGER,
        },
        CreatedBy: {
            type: DataTypes.STRING,
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        LastModifiedBy: {
            type: DataTypes.STRING,
        },
        LastModifiedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        isActive: {
            type: DataTypes.ENUM("0", "1", "2"),
            defaultValue: "1",
            comment: "0: InActive, 1: Active, 2: Deleted"
        }
    },
        {
            timestamps: false,
            tableName: "lessonquizHistory",
        }
    );
    return lessonquizHistory;
};

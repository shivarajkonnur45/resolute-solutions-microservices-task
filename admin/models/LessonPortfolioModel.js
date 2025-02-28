module.exports = (sequelize, DataTypes) => {
    const lessonportfolio = sequelize.define("lessonportfolio", {
        LessonPortfolioID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        Transcript: {
            type: DataTypes.STRING,
        },
        portfolioImage: {
            type: DataTypes.STRING
        },
        Position: {
            type: DataTypes.INTEGER,
        },
        isActive:{
            type: DataTypes.ENUM("0", "1", "2"),
            defaultValue: "1",
            comment: "0: InActive, 1: Active, 2: Deleted"
        }
    },
        {
            timestamps: false,
            tableName: "lessonportfolio",

        }
    );
    return lessonportfolio;
};

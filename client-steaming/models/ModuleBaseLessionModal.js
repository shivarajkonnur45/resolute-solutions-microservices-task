module.exports = (sequelize, DataTypes) => {
    const ModuleBaseLesson = sequelize.define("ModuleBaseLesson", {
        ModuleBaseLessonID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CourseVideoID: {
            type: DataTypes.INTEGER,
        },
        ModuleID: {
            type: DataTypes.INTEGER,
        },
        LessonID: {
            type: DataTypes.INTEGER,
        },
        UserID: {
            type: DataTypes.INTEGER,
        },
        LessonVideoName: {
            type: DataTypes.STRING,
        },
        BufferTime: {
            type: DataTypes.STRING,
        },
        Status: {
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
            tableName: "ModuleBaseLesson",
        }
        );
    return ModuleBaseLesson;
};
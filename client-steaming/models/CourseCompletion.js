module.exports = (sequelize, DataTypes) => {
    const CourseCompletion = sequelize.define("CourseCompletion", {
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
        TotalVideoCount: {
            type: DataTypes.INTEGER,
        },
        TotalCourseProgress: {
            type: DataTypes.INTEGER,
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
        {
            timestamps: false,
            tableName: "CourseCompletion",
        }
    );
    return CourseCompletion;
};
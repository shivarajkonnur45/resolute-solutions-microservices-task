module.exports = (sequelize, DataTypes) => {
    const CourseCategory = sequelize.define("CourseCategory", {
        CourseCategoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CategoryName: {
            type: DataTypes.STRING
        },
        isLinkedTo: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: "Number of courses it is linked"
        }
    },
        {
            timestamps: false,
            tableName: "CourseCategory",
        }
    );
    return CourseCategory;
};

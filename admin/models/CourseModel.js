module.exports = (sequelize, DataTypes) => {
    const CourseModel = sequelize.define("CourseModel", {
        courseId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        courseCategory: {
            type: DataTypes.STRING
        },
        courseGrade: {
            type: DataTypes.STRING
        },
        courseTag: {
            type: DataTypes.STRING
        },
        courseTitle: {
            type: DataTypes.STRING
        },
        courseDesc: {
            type: DataTypes.STRING
        },
        courseImage: {
            type: DataTypes.STRING
        },
        courseVideo: {
            type: DataTypes.STRING
        },
        courseVideoDuration: {
            type: DataTypes.INTEGER
        },
        courseSubtitle:{
            type: DataTypes.STRING
        },
        certificateTitle: {
            type: DataTypes.STRING
        },
        certificateImage: {
            type: DataTypes.STRING
        },
        trophyTitle: {
            type: DataTypes.STRING
        },
        trophyDesc: {
            type: DataTypes.STRING
        },
        trophyImage: {
            type: DataTypes.STRING
        },
        createdBy: {
            type: DataTypes.STRING
        },
        createdOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        isActive:{
            type: DataTypes.ENUM("0", "1", "2", "3"),
            defaultValue: "1",
            comment: "0: InActive Course, 1: Active Course, 2: Deleted Course, 3: Coming Soon"
        },
        isValid: {
            type: DataTypes.ENUM("0", "1"),
            defaultValue: "0"
        }
    },
        {
            timestamps: false,
            tableName: "CourseModel",
        }
    );
    return CourseModel;
};

module.exports = (sequelize, DataTypes) => {
    const CourseInterested = sequelize.define("CourseInterested", {
        CourseInterestedID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uniqueID:{
            type: DataTypes.CHAR(16),
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        UserID:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        CourseID:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        CourseName:{
            type: DataTypes.STRING
        },
        courseGrade:{
            type: DataTypes.STRING
        },
        IsPublished: {
            type: DataTypes.ENUM(['0', '1']),
            defaultValue: '0',
            comment: '0: Not Public, 1: Public',
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
    },
        {
            timestamps: false,
            tableName: "CourseInterested",
        }
    );
    return CourseInterested;
};

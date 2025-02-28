module.exports = (sequelize, DataTypes) => {
    const portfolio = sequelize.define("Portfolio", {
        PortfolioID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        portFolioLessonId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        StudentID: {
            type: DataTypes.INTEGER,
        },
        Description: {
            type: DataTypes.STRING,
        },
        Score: {
            type: DataTypes.FLOAT,
        },
        ScoreDateTime: {
            type: DataTypes.DATE
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
        Status: {
            type: DataTypes.ENUM(['0', '1', '2']),
            defaultValue: '0',
            comment: '0: Pending, 1: Accepted, 2: Rejected',
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2']),
            defaultValue: '1',
            comment: '0: Inactive, 1: Active',
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
        }
    },
        {
            timestamps: false,
            tableName: "Portfolio",

        }
    );
    return portfolio;
};

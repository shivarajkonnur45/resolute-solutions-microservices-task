module.exports = (sequelize, DataTypes) => {
    const adminhistory = sequelize.define("adminhistory", {
        UserHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER,
        },
        FirstName: {
            type: DataTypes.STRING,
        },
        LastName: {
            type: DataTypes.STRING,
        },
        TeamOrCompanyName: {
            type: DataTypes.STRING,
        },
        TeamMember: {
            type: DataTypes.INTEGER,
            default: 0
        },
        Email: {
            type: DataTypes.STRING,
        },
        Password: {
            type: DataTypes.STRING,
        },
        PhoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        AccountID: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        IsParticipateCompetitions: {
            type: DataTypes.ENUM(['1', '0']),
            default: '0'
        },
        IsNoSuPeAchPoQu: {
            type: DataTypes.ENUM(['1', '0']),
            default: '0'
        },
        IsNCourseExNewsProm: {
            type: DataTypes.ENUM(['1', '0']),
            default: '0'
        },
        IsLookFeedback: {
            type: DataTypes.ENUM(['1', '0']),
            default: '0'
        },
        AccountType: {
            type: DataTypes.ENUM('1', '2', '3', '4', '5',),
            // validate: { isIn: [['Student', 'Company', 'Parent', 'Admin', 'Editor']] },
            default: '1'
        },
        IsActive: {
            type: DataTypes.ENUM(['1', '0', '2']),
            default: '0'
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
            tableName: "adminhistory",
        }
    );
    return adminhistory;
};

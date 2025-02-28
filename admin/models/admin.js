module.exports = (sequelize, DataTypes) => {
    const admin = sequelize.define("admin", {
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        uniqueID:{
            type: DataTypes.CHAR(16),
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
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
            defaultValue: 0
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
            defaultValue: '0'
        },
        IsNoSuPeAchPoQu: {
            type: DataTypes.ENUM(['1', '0']),
            defaultValue: '0'
        },
        IsNCourseExNewsProm: {
            type: DataTypes.ENUM(['1', '0']),
            defaultValue: '0'
        },
        IsLookFeedback: {
            type: DataTypes.ENUM(['1', '0']),
            defaultValue: '0'
        },
        AccountType: {
            type: DataTypes.ENUM('1', '2', '3', '4', '5',),
            defaultValue: '1',
            comment: "'1 Student', '2 Company', '3 Parent', '4 Admin', '5 Editor'",
        },
        StaffPermission: {
            type: DataTypes.ENUM(['1', '0']),
            defaultValue: '0'
        },
        ParentID: {
            type: DataTypes.INTEGER,
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2']),
            defaultValue: '1',
            comment: '0: Inactive, 1: Active, 2: Deleted',
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
            tableName: "admin",
        }
    );
    return admin;
};

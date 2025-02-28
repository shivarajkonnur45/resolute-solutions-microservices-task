module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define("user", {
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
            allowNull: false
        },
        LastName: {
            type: DataTypes.STRING
        },
        TeamOrCompanyName: {
            type: DataTypes.STRING,
        },
        CompanyDomain:{
            type: DataTypes.STRING
        },
        TeamMember: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        TotalInvites: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        ManuallyAdded: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '0: Added via invite, 1: Added via form'
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        PhoneNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        IsParticipateCompetitions: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '0: Not participating, 1: Participating',
        },
        IsNoSuPeAchPoQu: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '0: Not applicable, 1: Applicable',
        },
        IsNCourseExNewsProm: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '0: Not interested, 1: Interested',
        },
        IsLookFeedback: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '0: Not looking for feedback, 1: Looking for feedback',
        },
        AccountType: {
            type: DataTypes.STRING,
            comment: '1: Student, 2: Company, 3: Parent',
        },
        ParentID: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        CompanyID: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        IsActive: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: '0: Inactive, 1: Active, 2: Deleted',
        },
        Grade: {
            type: DataTypes.STRING,
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
            tableName: "user",
        }
    );
    return user;
};

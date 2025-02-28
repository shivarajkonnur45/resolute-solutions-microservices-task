module.exports = (sequelize, DataTypes) => {
    const user_history = sequelize.define("user_history", {
        User_HistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER
        },
        FirstName: {
            type: DataTypes.STRING,
            allowNull: false
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
        IsActive: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: '0: Inactive, 1: Active',
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
            tableName: "user_history",
        }
        );
    return user_history;
};
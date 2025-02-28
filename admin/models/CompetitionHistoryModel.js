module.exports = (sequelize, DataTypes) => {
    const competitionhistory = sequelize.define("competitionhistory", {
        CompetitionHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CompetitionID: {
            type: DataTypes.INTEGER,
        },
        Grade: {
            type: DataTypes.STRING,
        },
        Format: {
            type: DataTypes.ENUM('In-person', 'Online'),
            validate: { isIn: [['In-person', 'Online']] },
            default: 'Online'
        },
        CompetitionTitle: {
            type: DataTypes.STRING,
        },
        CompetitionDescription: {
            type: DataTypes.TEXT,
        },
        CompetitionRequirements: {
            type: DataTypes.TEXT,
        },
        FirstPrize: {
            type: DataTypes.STRING,
        },
        SecondPrize: {
            type: DataTypes.STRING,
        },
        ThirdPrize: {
            type: DataTypes.STRING,
        },
        StartDate: {
            type: DataTypes.DATE,
        },
        EndDate: {
            type: DataTypes.DATE,
        },
        ImgFile: {
            type: DataTypes.STRING,
            allow: null,
        },
        VideoFile: {
            type: DataTypes.STRING,
            allow: null,
        },
        SubtitleFile: {
            type: DataTypes.STRING,
            allow: null,
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2']),
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
            tableName: "competitionhistory",
        }
    );
    return competitionhistory;
};

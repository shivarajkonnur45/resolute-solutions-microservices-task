module.exports = (sequelize, DataTypes) => {
    const competition = sequelize.define("competition", {
        CompetitionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
        CompetitionReason: {
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
        WinnerAnnouncementDate: {
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
            tableName: "competition",
        }
    );
    return competition;
};

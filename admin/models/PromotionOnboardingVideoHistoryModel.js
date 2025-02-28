module.exports = (sequelize, DataTypes) => {
    const promotiononboardingvideohistory = sequelize.define("promotiononboardingvideohistory", {
        PromotionOnboardingVideoHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        PromotionOnboardingVideoID: {
            type: DataTypes.INTEGER,
        },
        PromotionID: {
            type: DataTypes.INTEGER,
        },
        DeviceType: {
            type: DataTypes.STRING,
        },
        Title: {
            type: DataTypes.STRING,
        },
        Description: {
            type: DataTypes.STRING,
        },
        CTA: {
            type: DataTypes.STRING,
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
        }, Position: {
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
            tableName: "promotiononboardingvideohistory",
        }
    );
    return promotiononboardingvideohistory;
};

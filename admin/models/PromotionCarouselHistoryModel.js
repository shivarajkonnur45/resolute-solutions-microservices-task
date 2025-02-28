module.exports = (sequelize, DataTypes) => {
    const promotioncarouselhistory = sequelize.define("promotioncarouselhistory", {
        PromotionCarouselHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        PromotionCarouselID: {
            type: DataTypes.INTEGER,
        },
        PromotionID: {
            type: DataTypes.INTEGER,
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
        },
        Position: {
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
            tableName: "promotioncarouselhistory",
        }
    );
    return promotioncarouselhistory;
};

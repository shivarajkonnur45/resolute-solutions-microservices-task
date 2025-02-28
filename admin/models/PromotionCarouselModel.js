module.exports = (sequelize, DataTypes) => {
    const promotioncarousel = sequelize.define("promotioncarousel", {
        PromotionCarouselID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        PromotionID: {
            type: DataTypes.INTEGER,
            references: {
                model: "promotion",
                key: "PromotionID"
            }
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
        VideoFileLength: {
            type: DataTypes.INTEGER,
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
            tableName: "promotioncarousel",
            indexes: [
                {
                    fields: ["PromotionID"]
                }
            ]
        }
    );
    return promotioncarousel;
};

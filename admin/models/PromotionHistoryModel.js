module.exports = (sequelize, DataTypes) => {
    const promotionhistory = sequelize.define("promotionhistory", {
        PromotionHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        PromotionID: {
            type: DataTypes.INTEGER,
        },
        PromotionTitle: {
            type: DataTypes.STRING,
        },
        AccountType: {
            type: DataTypes.ENUM('1', '2', '3'),
            validate: { isIn: [['1', '2', '3'],] },

        },
        CTA: {
            type: DataTypes.STRING,
        },
        MembershipBannerTitle: {
            type: DataTypes.STRING,
        },
        MembershipBannerCTA: {
            type: DataTypes.STRING,
        },
        MembershipBannerTag: {
            type: DataTypes.STRING,
        },
        MembershipReferralTitle: {
            type: DataTypes.STRING,
        },
        MembershipReferralCTA: {
            type: DataTypes.STRING,
        },
        MembershipReferralTag: {
            type: DataTypes.STRING,
        },
        MembershipReferralDescription: {
            type: DataTypes.STRING,
        },
        IsActive: {
            type: DataTypes.INTEGER,
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
            tableName: "promotionhistory",
        }
    );
    return promotionhistory;
};

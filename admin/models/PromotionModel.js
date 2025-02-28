module.exports = (sequelize, DataTypes) => {
    const promotion = sequelize.define("promotion", {
        PromotionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
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
            default: 0,
            comment: '0: Inactive, 1: Active',
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
            tableName: "promotion",
        }
    );
    return promotion;
};

module.exports = (sequelize, DataTypes) => {
    const Subscription = sequelize.define("Subscription", {
        SubscriptionID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        StripeCustomerID: {
            type: DataTypes.STRING,
        },
        PlanID: {
            type: DataTypes.STRING,
        },
        SubscriptionIDStripe:{
            type: DataTypes.STRING,
        },
        PaymentIntentIDStripe:{
            type: DataTypes.STRING,
        },
        Plan: {
            type: DataTypes.STRING,
        },
        Amount: {
            type: DataTypes.FLOAT,
        },
        PlanStartDate: {
            type: DataTypes.DATE,
        },
        PlanEndDate: {
            type: DataTypes.DATE,
        },
        SubscriptionStatus: {
            type: DataTypes.INTEGER,
            comment: '0 Inactive Plan 1: Active Plan',
        },
        CompanyID: {
            type: DataTypes.INTEGER
        },
        ParentID: {
            type: DataTypes.INTEGER
        },
        SubscriptionCount: {
            type: DataTypes.INTEGER
        },
        SubEmail:{
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
        tableName: "Subscription",
    });
    return Subscription;
};

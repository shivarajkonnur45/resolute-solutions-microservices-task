module.exports = (sequelize, DataTypes) => {
    const StripeCustomer = sequelize.define("StripeCustomer", {
        CustomerID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        StudentID:{
            type: DataTypes.INTEGER
        },
        UserID: {
            type: DataTypes.INTEGER
        },
        ParentID: {
            type: DataTypes.INTEGER
        },
        StripeCustomerID: {
            type: DataTypes.STRING
        },
        SubscriptionIDStripe:{
            type: DataTypes.STRING
        },
        SubscriptionStatus: {
            type: DataTypes.INTEGER,
            comment: '0 Inactive Plan 1: Active Plan',
        },
        CreatedBy: {
            type: DataTypes.STRING,
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
        {
            timestamps: false,
            tableName: "StripeCustomer",
        }
    );
    return StripeCustomer;
};
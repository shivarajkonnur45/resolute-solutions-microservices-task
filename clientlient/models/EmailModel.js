module.exports = (sequelize, DataTypes) => {
    const EmailModel = sequelize.define("EmailModel", {
        EmailModelID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        emailType:{
            type: DataTypes.STRING,
            allowNull: false
        },
        sendInBlueId:{
            type: DataTypes.INTEGER,
        },
        Subject:{
            type: DataTypes.STRING
        },
        Header:{
            type: DataTypes.STRING
        },
        Greetings:{
            type: DataTypes.STRING
        },
        Title:{
            type: DataTypes.STRING
        },
        Time_limit:{
            type: DataTypes.INTEGER
        },
        Time_type:{
            type: DataTypes.STRING
        },
        Time_limit_content:{
            type: DataTypes.STRING
        },
        Salutations:{
            type: DataTypes.STRING
        },
        Support_Email:{
            type: DataTypes.STRING
        },
        Tip:{
            type: DataTypes.STRING
        },
        Guidelines:{
            type: DataTypes.STRING,
            comment:"This is support description"
        },
        Email_body:{
            type: DataTypes.STRING
        },
        List_title:{
            type: DataTypes.STRING
        },
        Privileges:{
            type: DataTypes.STRING
        },
        Offer_title:{
            type: DataTypes.STRING
        },
        Offers_list_title:{
            type: DataTypes.STRING
        },
        Offers_list_first:{
            type: DataTypes.STRING
        },
        Offers_list_second:{
            type: DataTypes.STRING
        },
        Offers_list_third:{
            type: DataTypes.STRING
        },
        Offers_list_fourth:{
            type: DataTypes.STRING
        },
        Email_about:{
            type: DataTypes.STRING
        },
        LastModifiedBy: {
            type: DataTypes.STRING,
        },
        LastModifiedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
        {
            timestamps: false,
            tableName: "EmailModel",
        }
        );
    return EmailModel;
};
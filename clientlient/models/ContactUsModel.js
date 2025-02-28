module.exports = (sequelize, DataTypes) => {
    const contactus = sequelize.define("contactus", {
        ContactUsID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER,
            references: {
                model: "user",
                key: "UserID"
            },
            allowNull: false
        },
        ContactType: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '0: Learning_Advisor, 1: Learning_Experience, 2 Leave Feedback',
        },
        Email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        AccountType: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: '2: Company, 3: Parent',
        },
        CreatedBy: {
            type: DataTypes.STRING,
            allowNull: false
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        LastModifiedBy: {
            type: DataTypes.STRING,
            allowNull: false
        },
        LastModifiedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
        {
            timestamps: false,
            tableName: "contactus",
            indexes: [
                {
                    fields: ["UserID"]
                }
            ]
        }
    );
    return contactus;
};
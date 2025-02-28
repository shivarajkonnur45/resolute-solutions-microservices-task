module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define("useremail", {
        UserEmailID: {
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
        Email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2']),
            defaultValue: '1'
        }
    },
        {
            timestamps: false,
            tableName: "useremail",
        }
    );
    return user;
};
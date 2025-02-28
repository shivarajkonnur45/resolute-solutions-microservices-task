module.exports = (sequelize, DataTypes) => {
    const userEmail = sequelize.define("userEmail", {
        UserID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        emailUser:{
            type: DataTypes.STRING
        }
    },
        {
            timestamps: false,
            tableName: "userEmail",
        }
    );
    return userEmail;
};

module.exports = (sequelize, DataTypes) => {
    const freezeInvite = sequelize.define("freezeInvite", {
        freezeInviteId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userEmail:{
            type:DataTypes.STRING,
            allowNull:false
        },
        companyId:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    },
        {
            timestamps: false,
            tableName: "freezeInvite",
        }
    );
    return freezeInvite;
};
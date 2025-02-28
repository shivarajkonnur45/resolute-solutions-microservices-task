module.exports = (sequelize, DataTypes) => {
    const moduleModel = sequelize.define("moduleModel", {
        moduleID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        forCourse:{
            type: DataTypes.INTEGER
        }
    },
        {
            timestamps: false,
            tableName: "userEmail",
        }
    );
    return moduleModel;
};

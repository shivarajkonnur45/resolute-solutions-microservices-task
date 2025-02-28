module.exports = (sequelize, DataTypes) => {
    const Module = sequelize.define("Module", {
        ModuleID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Title: {
            type: DataTypes.STRING
        },
        Description: {
            type: DataTypes.STRING
        },
        moduleImage: {
            type: DataTypes.STRING
        },
        moduleVideo: {
            type: DataTypes.STRING
        },
        moduleVideoDuration: {
            type: DataTypes.INTEGER
        },
        moduleSubtitle: {
            type: DataTypes.STRING
        },
        courseId: {
            type: DataTypes.INTEGER
        },
        position :{
            type: DataTypes.INTEGER
        },
        isActive:{
            type: DataTypes.ENUM("0", "1", "2"),
            defaultValue: "1",
            comment: "0: InActive, 1: Active, 2: Deleted"
        }
    },
        {
            timestamps: false,
            tableName: "Module",
        }
    );
    return Module;
};

module.exports = (sequelize, DataTypes) => {
    const ModuleHistory = sequelize.define("ModuleHistory", {
        ModuleHistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ModuleID: {
            type: DataTypes.INTEGER,
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
        moduleSubtitle: {
            type: DataTypes.STRING
        },
        courseId: {
            type: DataTypes.INTEGER
        },
        position: {
            type: DataTypes.INTEGER
        },
        isActive: {
            type: DataTypes.ENUM("0", "1", "2"),
            defaultValue: "1",
            comment: "0: InActive, 1: Active, 2: Deleted"
        }
    },
        {
            timestamps: false,
            tableName: "ModuleHistory",
        }
    );
    return ModuleHistory;
};

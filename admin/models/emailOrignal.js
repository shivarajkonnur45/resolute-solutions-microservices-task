module.exports = (sequelize, DataTypes) => {
    const staffAdmin = sequelize.define("staffAdmin", {
        StaffID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        staffEmail:{
            type: DataTypes.STRING
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2']),
            defaultValue: '1',
            comment: '0: Inactive, 1: Active, 2: Deleted',
        },
    },
        {
            timestamps: false,
            tableName: "staffAdmin",
        }
    );
    return staffAdmin;
};

module.exports = (sequelize, DataTypes) => {
    const Certificate = sequelize.define("Certificate", {
        CertificateID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserID: {
            type: DataTypes.INTEGER,
        },
        LessonID: {
            type: DataTypes.INTEGER,
        },
        ModuleID: {
            type: DataTypes.INTEGER,
        },
        CourseID: {
            type: DataTypes.INTEGER,
        },
        Title: {
            type: DataTypes.STRING,
        },
        CertificateImage:{
            type: DataTypes.STRING
        }
    },
        {
            timestamps: false,
            tableName: "Certificate",
        }
    );
    return Certificate;
};

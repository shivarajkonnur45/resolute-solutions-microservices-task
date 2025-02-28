module.exports = (sequelize, DataTypes) => {
    const PathwayHistory = sequelize.define("Pathway_History", {
        Pathway_HistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        PathwayID: {
            type: DataTypes.INTEGER
        },
        PathwayTitle:{
            type: DataTypes.STRING
        },
        PathwayTag:{
            type: DataTypes.STRING
        },
        PathwayCategory:{
            type: DataTypes.STRING
        },
        PathwayDescription:{
            type: DataTypes.STRING
        },
        IsParentCatolog:{
            type: DataTypes.ENUM('0','1'),
            default:'0'
        },
        CertificateTitle:{
            type: DataTypes.STRING
        },
        Grade:{
            type:DataTypes.STRING
        },
        TrophyTitle:{
            type:DataTypes.STRING
        },
        Courses:{
            type:DataTypes.STRING
        },
        Title:{
            type:DataTypes.STRING
        },
        Tag:{
            type:DataTypes.STRING
        },
        TrophyDescription:{
            type:DataTypes.STRING
        },
        courseImage:{
            type:DataTypes.STRING
        },
        courseVideo:{
            type:DataTypes.STRING
        },
        courseSubtitle:{
            type:DataTypes.STRING
        },
        certificateImage:{
            type:DataTypes.STRING
        },
        trophyImage:{
            type:DataTypes.STRING
        }
    },
        {
            timestamps: false,
            tableName: "Pathway_History",
        }
    );
    return PathwayHistory;
};

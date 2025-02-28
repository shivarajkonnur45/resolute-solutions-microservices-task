module.exports = (sequelize, DataTypes) => {
    const flowcoures = sequelize.define("flowcoures", {
        courseId: {
            type: DataTypes.INTEGER,
        },
        FlowID: {
            type: DataTypes.INTEGER,
        },
        courseCategory: {
            type: DataTypes.STRING
        },
        courseGrade: {
            type: DataTypes.STRING
        },
        courseTag: {
            type: DataTypes.STRING
        },
        courseTitle: {
            type: DataTypes.STRING
        },
        courseDesc: {
            type: DataTypes.STRING
        },
        courseImage: {
            type: DataTypes.STRING
        },
        courseVideo: {
            type: DataTypes.STRING
        },
        certificateTitle: {
            type: DataTypes.STRING
        },
        certificateImage: {
            type: DataTypes.STRING
        },
        trophyTitle: {
            type: DataTypes.STRING
        },
        trophyDesc: {
            type: DataTypes.STRING
        },
        trophyImage: {
            type: DataTypes.STRING
        },


    },
        {
            timestamps: false,
            tableName: "flowcoures",

        }
    );
    return flowcoures;
};

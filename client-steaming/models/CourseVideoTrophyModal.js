module.exports = (sequelize, DataTypes) => {
    const CourseVideoTrophy = sequelize.define("CourseVideoTrophy", {
        CourseVideoTrophyID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        CourseVideoID: {
            type: DataTypes.INTEGER,
        },
        UserID: {
            type: DataTypes.INTEGER,
        },
        VideoName: {
            type: DataTypes.STRING,
            // allowNull: false
        },
        TrophyImageName: {
            type: DataTypes.STRING,
            // allowNull: false
        },CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },
        {
            timestamps: false,
            tableName: "CourseVideoTrophy",
        }
        );
    return CourseVideoTrophy;
};
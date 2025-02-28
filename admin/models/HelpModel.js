module.exports = (sequelize, DataTypes) => {
    const help = sequelize.define("help", {
        HelpID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        AccountType: {
            type: DataTypes.ENUM('2', '3'),
            validate: { isIn: [['2', '3']] },
            default: '3'
        },
        Title: {
            type: DataTypes.STRING,
        },
        Description: {
            type: DataTypes.TEXT('long'),
        },
        Category: {
            type: DataTypes.STRING,
        },
        ImgFile: {
            type: DataTypes.STRING,
            allow: null,
        },
        VideoFile: {
            type: DataTypes.STRING,
            allow: null,
        },
        SubtitleFile: {
            type: DataTypes.STRING,
            allow: null,
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2']),
            default: '0'
        },
        CreatedBy: {
            type: DataTypes.STRING,
        },
        CreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        LastModifiedBy: {
            type: DataTypes.STRING,
        },
        LastModifiedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
        {
            timestamps: false,
            tableName: "help",
        }
    );
    return help;
};

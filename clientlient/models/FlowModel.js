module.exports = (sequelize, DataTypes) => {
    const flow = sequelize.define("flow", {
        FlowID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        StudentID: {
            type: DataTypes.INTEGER,
            references: {
                model: "user",
                key: "UserID"
            }
        },
        ParentID: {
            type: DataTypes.INTEGER
        },
        Grade: {
            type: DataTypes.STRING,
        },
        CourseIDs: {
            type: DataTypes.STRING,

        },
        Courses: {
            type: DataTypes.JSON,
        },
        LessonIDs: {
            type: DataTypes.STRING,
        },
        Lessons: {
            type: DataTypes.JSON,
        },
        PathwayIDs: {
            type: DataTypes.STRING,
        },
        FirstName: {
            type: DataTypes.STRING,
        },
        LastName: {
            type: DataTypes.STRING,
        },
        LearningStyle: {
            type: DataTypes.INTEGER,
        },
        KnowledgeCheck: {
            type: DataTypes.INTEGER,
        },
        StartDate: {
            type: DataTypes.DATEONLY,
        },
        EndDate: {
            type: DataTypes.DATEONLY,
        },
        BreakTime: {
            type: DataTypes.STRING,
        },
        Monday: {
            type: DataTypes.STRING,
        },
        MondayEnd: {
            type: DataTypes.STRING,
        },
        Tuesday: {
            type: DataTypes.STRING,
        },
        TuesdayEnd: {
            type: DataTypes.STRING,
        },
        Wednesday: {
            type: DataTypes.STRING,
        },
        WednesdayEnd: {
            type: DataTypes.STRING,
        },
        Thursday: {
            type: DataTypes.STRING,
        },
        ThursdayEnd: {
            type: DataTypes.STRING,
        },
        Friday: {
            type: DataTypes.STRING,
        },
        FridayEnd: {
            type: DataTypes.STRING,
        },
        Saturday: {
            type: DataTypes.STRING,
        },
        SaturdayEnd: {
            type: DataTypes.STRING,
        },
        Sunday: {
            type: DataTypes.STRING,
        },
        SundayEnd: {
            type: DataTypes.STRING,
        },
        IsCustomize: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: '0: No, 1: Yes',
        },
        IsActive: {
            type: DataTypes.ENUM(['0', '1', '2', '3']),
            defaultValue: '1',
            comment:'0: Completed, 1: Assigned 2: Planner Deleted, 3: Is In Progress'

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
            tableName: "flow",
            indexes: [
                {
                    fields: ["StudentID"]
                },
            ]
        }
    );
    return flow;
};

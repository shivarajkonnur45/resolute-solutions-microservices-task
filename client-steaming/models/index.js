const dbConfig = require("../config/db.js");

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    logging: false, //! Set logging to false to disable logging
    timezone: '+02:00', //! Use the UTC offset for Kolkata
});

sequelize.authenticate()
    .then(() => {
        console.log("connected..");
    })
    .catch((err) => {
        console.log("Error" + err);
    });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//1 Course
db.CourseVideo = require("./CourseVideoModal.js")(sequelize, DataTypes);
db.CourseVideoTrophy = require("./CourseVideoTrophyModal.js")(sequelize, DataTypes);
db.CourseCompletion = require("./CourseCompletion.js")(sequelize, DataTypes);

//2 Module lession
db.ModuleBaseLesson = require("./ModuleBaseLessionModal.js")(sequelize, DataTypes);

// Lesson Quiz
db.LessonQuiz = require("./QuizModal.js")(sequelize, DataTypes);

// Lesson Quiz
db.LessonBadge = require("./LessonBadgeModal.js")(sequelize, DataTypes);

// Certificate
db.Certificate = require("./CertificateModal.js")(sequelize, DataTypes);


db.sequelize.sync({ force: false, alter: true })
.then(() => {
    console.log("yes re-sync done!");
})
.catch((error) => {
    console.error("Error while syncing the database:", error);
});

module.exports = db;
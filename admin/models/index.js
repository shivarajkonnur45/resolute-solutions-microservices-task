const dbConfig = require('../config/db.js');
const { Sequelize, DataTypes } = require("sequelize");
// console.log(dbConfig);
require('dotenv').config();
// console.log(process.env.DB_HOST);
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    logging: false
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

db.admin = require('../models/admin')(sequelize, DataTypes);
// db.user = require('../models/user.js')(sequelize, DataTypes);
db.adminhistory = require('../models/AdminHistoryModel.js')(sequelize, DataTypes);
db.staffAdmin = require('../models/emailOrignal.js')(sequelize, DataTypes);
db.userEmail = require('../models/userEmails.js')(sequelize, DataTypes);

//! Course Starts here -------------------------->>

db.CourseModel = require('../models/CourseModel.js')(sequelize, DataTypes);
db.coursehistory = require('../models/CoursHistoryModel.js')(sequelize, DataTypes);

db.CourseCategory = require('../models/courseCategory.js')(sequelize, DataTypes);
// db.CourseCategoryHistory = require('../models/CourseCategoryHistoryModel.js')(sequelize, DataTypes);

db.Module = require('../models/Module.js')(sequelize, DataTypes);
db.ModuleHistory = require('../models/ModuleHistory.js')(sequelize, DataTypes);

db.Lesson = require('../models/Lesson.js')(sequelize, DataTypes);
db.LessonHistory = require('../models/LessonHistory.js')(sequelize, DataTypes);

db.lessontopic = require('../models/LessonTopicModel.js')(sequelize, DataTypes);
db.lessontopicHistory = require('../models/LessonTopicModelHistory.js')(sequelize, DataTypes);

db.lessonbadge = require('../models/LessonBadgeModel.js')(sequelize, DataTypes);
db.lessonbadgeHistory = require('../models/LessonBadgeModelHistory.js')(sequelize, DataTypes);

db.lessonportfolio = require('../models/LessonPortfolioModel.js')(sequelize, DataTypes);
db.lessonportfolioHistory = require('../models/LessonPortfolioModelHistory.js')(sequelize, DataTypes);

db.lessonquiz = require('../models/LessonQuizModel.js')(sequelize, DataTypes);
db.lessonquizHistory = require('../models/LessonQuizModelHistory.js')(sequelize, DataTypes);

//Pathway (Courses Subpart)
db.Pathway = require('../models/Pathway.js')(sequelize, DataTypes);
db.PathwayHistory = require('../models/PathwayHistoryModel.js')(sequelize, DataTypes);
//! Course Ends here ---------------------------->>

//! Association for Courses >>
//for course linking --START--
db.CourseModel.hasMany(db.Module, { foreignKey: 'courseId' });
db.Module.belongsTo(db.CourseModel);

db.CourseModel.hasMany(db.Lesson, { foreignKey: 'courseId' });
db.Lesson.belongsTo(db.CourseModel);

db.CourseModel.hasMany(db.lessonbadge, { foreignKey: 'courseId' });
db.lessonbadge.belongsTo(db.CourseModel);

db.CourseModel.hasMany(db.lessontopic, { foreignKey: 'courseId' });
db.lessontopic.belongsTo(db.CourseModel);

db.CourseModel.hasMany(db.lessonportfolio, { foreignKey: 'courseId' });
db.lessonportfolio.belongsTo(db.CourseModel);

db.CourseModel.hasMany(db.lessonquiz, { foreignKey: 'courseId' });
db.lessonquiz.belongsTo(db.CourseModel);

db.CourseModel.hasMany(db.Lesson, { foreignKey: 'courseId' });
db.Lesson.belongsTo(db.CourseModel);
//for course linking --END--

db.Module.hasMany(db.Lesson);
db.Lesson.belongsTo(db.Module);

db.Lesson.hasMany(db.lessontopic);
db.lessontopic.belongsTo(db.Lesson);

db.Lesson.hasMany(db.lessonbadge);
db.lessonbadge.belongsTo(db.Lesson);

db.Lesson.hasMany(db.lessonportfolio);
db.lessonportfolio.belongsTo(db.Lesson);

db.Lesson.hasMany(db.lessonquiz);
db.lessonquiz.belongsTo(db.Lesson);

db.visualnotification = require('./VisualNotification.js')(sequelize, DataTypes);

//!Association end here <<
// db.moduleModel = require('../models/moduleModel.js')(sequelize, DataTypes);

db.reflection = require('./ReflectionsModel.js')(sequelize, DataTypes);
db.reflectionhistory = require('./ReflectionsHistoryModel.js')(sequelize, DataTypes);

db.help = require('./HelpModel.js')(sequelize, DataTypes);
db.helphistory = require('./HelpHistoryModel.js')(sequelize, DataTypes);

db.competition = require('./CompetitionModel.js')(sequelize, DataTypes);
db.competitionhistory = require('./CompetitionHistoryModel.js')(sequelize, DataTypes);


db.promotion = require('./PromotionModel.js')(sequelize, DataTypes);
db.promotionhistory = require('./PromotionHistoryModel.js')(sequelize, DataTypes);

db.promotioncarousel = require('./PromotionCarouselModel.js')(sequelize, DataTypes);
db.promotioncarouselhistory = require('./PromotionCarouselHistoryModel.js')(sequelize, DataTypes);

db.promotionvideo = require('./PromotionVideoModel.js')(sequelize, DataTypes);
db.promotionvideohistory = require('./PromotionVideoHistoryModel.js')(sequelize, DataTypes);

db.promotiononboardingvideo = require('./PromotionOnboardingVideoModel.js')(sequelize, DataTypes);
db.promotiononboardingvideohistory = require('./PromotionOnboardingVideoHistoryModel.js')(sequelize, DataTypes);

db.CourseInterested = require('./CourseInterested.js')(sequelize, DataTypes);
db.resetPassword = require('./ResetPassword.js')(sequelize, DataTypes);

async function showPromotionData() {
    try {
        const accountTypes = ['1', '2', '3'];

        for (const type of accountTypes) {
            let promotionData = await db.promotion.findOne({ where: { AccountType: type } });
            if (!promotionData) {
                await db.promotion.create({
                    AccountType: type,
                    IsActive: 1,
                });

            }
        }
    } catch (error) {
        console.error('Error fetching or updating promotion data:', error);
    }
}

// Call the function to execute the logic
setTimeout(() => {
    showPromotionData();
}, 5000);

// db.report = require('./ReportModel.js')(sequelize, DataTypes);

//! -------------------- promotion --------------------! \\

//For promotion and promotioncarousel

db.promotion.hasMany(db.promotioncarousel, { foreignKey: "PromotionID", as: "promotioncarousel", });
db.promotioncarousel.belongsTo(db.promotion, { foreignKey: "PromotionID", as: "promotion" });

//For promotion and promotiononboardingvideo
db.promotion.hasMany(db.promotiononboardingvideo, { foreignKey: "PromotionID", as: "promotiononboardingvideo", });
db.promotiononboardingvideo.belongsTo(db.promotion, { foreignKey: "PromotionID", as: "promotion" });

// //For promotion and promotionvideo
db.promotion.hasMany(db.promotionvideo, { foreignKey: "PromotionID", as: "promotionvideo", });
db.promotionvideo.belongsTo(db.promotion, { foreignKey: "PromotionID", as: "promotion" });

//! -------------------- End promotion --------------------! \\






db.sequelize.sync({ force: false, alter: true })
    .then(() => {
        console.log("yes re-sync done!");
    })
    .catch((error) => {
        console.error("Error while syncing the database:", error);
    });



module.exports = db;





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

db.user = require("./UserModal.js")(sequelize, DataTypes);
db.UserHistory = require("./UserHistoryModal.js")(sequelize, DataTypes);
db.useremail = require("./UserEmail.js")(sequelize, DataTypes);
db.contactus = require("./ContactUsModel.js")(sequelize, DataTypes);
db.flow = require("./FlowModel.js")(sequelize, DataTypes);

db.flowhistory = require("./FlowHistoryModel.js")(sequelize, DataTypes);
db.flowcoures = require("./FlowCouresModel.js")(sequelize, DataTypes);
db.flowlesson = require("./FlowLessonModel.js")(sequelize, DataTypes);


db.portfolio = require("./PortfolioModal.js")(sequelize, DataTypes);
db.portfoliofile = require("./PortfoliofileModal.js")(sequelize, DataTypes);

db.portfolio.hasMany(db.portfoliofile, { foreignKey: 'PortfolioID' });
db.portfoliofile.belongsTo(db.portfolio);

db.clientachievement = require("./ClientAchievements.js")(sequelize, DataTypes);

db.StripeCustomer = require("./StripeCustomerModal.js")(sequelize, DataTypes);
db.Subscription = require("./SubscriptionModal.js")(sequelize, DataTypes);
db.FreeTrail = require("./FreeTrialSubscription.js")(sequelize, DataTypes);

db.OTP = require('./OtpModel.js')(sequelize, DataTypes);

db.visualnotification = require('./VisualNotification.js')(sequelize, DataTypes);
db.emailnotification = require('./EmailNotification.js')(sequelize, DataTypes);

db.clientachievementCourse = require("./ClientAchievementCourse.js")(sequelize, DataTypes);

db.EmailModel = require('./EmailModel.js')(sequelize, DataTypes);
db.freezeSub = require('./FreezeSubscription.js')(sequelize, DataTypes);

db.freezeInvite = require('./FreezeInvite.js')(sequelize, DataTypes);
db.resetPassword = require('./ResetPassword.js')(sequelize, DataTypes);

db.sequelize.sync({ force: false, alter: true })
    .then(() => {
        console.log("yes re-sync done!");
    })
    .catch((error) => {
        console.error("Error while syncing the database:", error);
    });



module.exports = db;

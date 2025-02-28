const Joi = require('joi');

const loginSchema = Joi.object({
    Email: Joi.string().max(256),
    Password: Joi.string().max(256),
});


const userSchema = Joi.object({
    FirstName: Joi.string().trim().required(),
    LastName: Joi.string().trim().required(),
    TeamOrCompanyName: Joi.string().allow(null),
    TeamMember: Joi.number().default(0),
    Email: Joi.string().email().required(),
    Password: Joi.string().min(6).required(),
    PhoneNumber: Joi.string().allow(null),
    IsParticipateCompetitions: Joi.number().integer().valid(0, 1).default(0),
    IsNoSuPeAchPoQu: Joi.number().integer().valid(0, 1).default(0),
    IsNCourseExNewsProm: Joi.number().integer().valid(0, 1).default(0),
    IsLookFeedback: Joi.number().integer().valid(0, 1).default(0),
    AccountType: Joi.string().valid('1', '2', '3'),
    ParentID: Joi.number().integer(),
    Grade: Joi.string().allow(null),
    IsActive: Joi.number().integer().valid(0, 1).default(1),
});

const contactusSchema = Joi.object({
    ContactType: Joi.number().integer().required().valid(0, 1, 2),
    Email: Joi.string().email().required(),
    Message: Joi.string().required(),
    AccountType: Joi.string().valid('2', '3').required(),
});

const flowSchema = Joi.object({
    StudentID: Joi.number().integer().required(),
    ParentID: Joi.number().integer().allow(null),
    // Grade: Joi.string().allow(null), 
    CourseIDs: Joi.string().allow(''),
    // Courses: Joi.array().items(Joi.object()), 
    LessonIDs: Joi.string().allow(''),
    // Lessons: Joi.array().items(Joi.object()), 
    FirstName: Joi.string().allow(''),
    LastName: Joi.string().allow(''),
    LearningStyle: Joi.number().integer(),
    KnowledgeCheck: Joi.number().integer(),
    StartDate: Joi.date().required(),
    BreakTime: Joi.string().allow(''),
    Monday: Joi.string().allow(''),
    MondayEnd: Joi.string().allow(''),
    Tuesday: Joi.string().allow(''),
    TuesdayEnd: Joi.string().allow(''),
    Wednesday: Joi.string().allow(''),
    WednesdayEnd: Joi.string().allow(''),
    Thursday: Joi.string().allow(''),
    ThursdayEnd: Joi.string().allow(''),
    Friday: Joi.string().allow(''),
    FridayEnd: Joi.string().allow(''),
    Saturday: Joi.string().allow(''),
    SaturdayEnd: Joi.string().allow(''),
    Sunday: Joi.string().allow(''),
    SundayEnd: Joi.string().allow(''),
    IsActive: Joi.string().valid('0', '1', '2').default('0'),
});

const portfolioSchema = Joi.object({
    StudentID: Joi.number().integer().required(),
    Description: Joi.string().allow(null),
    Score: Joi.number().integer(),
    Scoredetail: Joi.string().allow(null),
    ScoreDateTime: Joi.date().allow(null),
});


module.exports = {
    flowSchema,
    loginSchema,
    contactusSchema,
    userSchema,
    portfolioSchema,
};


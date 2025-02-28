const Joi = require("joi");

const loginSchema = Joi.object({
  Email: Joi.string().max(256),
  Password: Joi.string().max(256),
});

const parentSchema = Joi.object({
  FirstName: Joi.string().required(),
  LastName: Joi.string().required(),
  Email: Joi.string().required(),
  PhoneNumber: Joi.string().allow(null, ""),
  Password: Joi.string().required(),
  IsNoSuPeAchPoQu: Joi.number().valid(0, 1).default(0).optional(),
  IsNCourseExNewsProm: Joi.number().valid(0, 1).default(0).optional(),
  IsLookFeedback: Joi.number().valid(0, 1).default(0),
  IsActive: Joi.number().valid(0, 1).default(0),
});
const parentUpdateSchema = Joi.object({
  FirstName: Joi.string().optional(),
  LastName: Joi.string().optional(),
  Email: Joi.string().optional(),
  PhoneNumber: Joi.string().allow(null, ""),
  Password: Joi.string().optional(),
  IsNoSuPeAchPoQu: Joi.number().valid(0, 1).default(0).optional(),
  IsNCourseExNewsProm: Joi.number().valid(0, 1).default(0).optional(),
  IsLookFeedback: Joi.number().valid(0, 1).default(0),
  IsActive: Joi.number().valid(0, 1).default(0),
});

const studentSchema = Joi.object({
  Grade: Joi.string().allow(null).required(),
  FirstName: Joi.string().required(),
  LastName: Joi.string().required(),
  Email: Joi.string().required(),
  PhoneNumber: Joi.string().allow(null, ""),
  Password: Joi.string().required(),
  IsParticipateCompetitions: Joi.number().valid(0, 1).default(0).optional(),
  IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
  IsActive: Joi.number().valid(0, 1).default(0),
  deviceToken: Joi.string().optional()
});
const studentUpdateSchema = Joi.object({
  Grade: Joi.string().allow(null).optional(),
  FirstName: Joi.string().optional(),
  LastName: Joi.string().optional(),
  Email: Joi.string().optional(),
  PhoneNumber: Joi.string().allow(null, ""),
  Password: Joi.string().optional(),
  IsParticipateCompetitions: Joi.number().valid(0, 1).default(0).optional(),
  IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
  IsActive: Joi.number().valid(0, 1).default(0),
});

const companySchema = Joi.object({
  FirstName: Joi.string().required(),
  LastName: Joi.string().required(),
  Email: Joi.string().required(),
  PhoneNumber: Joi.string().allow(null, ""),
  Password: Joi.string().required(),
  IsNCourseExNewsProm: Joi.number().valid(0, 1).default(0).optional(),
  IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
  IsActive: Joi.number().valid(0, 1).default(0),
  TeamOrCompanyName: Joi.string().optional(),
  TeamMember: Joi.number().default(0).optional(),
});
const companyUpdateSchema = Joi.object({
  FirstName: Joi.string().required(),
  LastName: Joi.string().required(),
  Email: Joi.string().optional(),
  PhoneNumber: Joi.string().allow(null, ""),
  Password: Joi.string().optional(),
  IsNCourseExNewsProm: Joi.number().valid(0, 1).default(0).optional(),
  IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
  IsActive: Joi.number().valid(0, 1).default(0),
  TeamOrCompanyName: Joi.string().optional(),
  TeamMember: Joi.number().default(0).optional(),
});

const contactusSchema = Joi.object({
  ContactType: Joi.number().integer().required().valid(0, 1, 2),
  Email: Joi.string().email().required(),
  Message: Joi.string().required(),
});

const flowSchema = Joi.object({
  StudentID: Joi.number().integer().required(),
  CourseIDs: Joi.string().optional(),
  LessonIDs: Joi.string().optional(),
  Pathways: Joi.string().optional(),
  LearningStyle: Joi.number().allow(null).optional(),
  Grade: Joi.string().optional(),
  IsCustomize: Joi.number().valid(0, 1).required(),
  KnowledgeCheck: Joi.number().valid(0, 1).required(),
  StartDate: Joi.date().required(),
  EndDate: Joi.date().required(),
  BreakTime: Joi.string().allow(null).optional(),
  Monday: Joi.string().allow(null).optional(),
  MondayEnd: Joi.string().allow(null).optional(),
  Tuesday: Joi.string().allow(null).optional(),
  TuesdayEnd: Joi.string().allow(null).optional(),
  Wednesday: Joi.string().allow(null).optional(),
  WednesdayEnd: Joi.string().allow(null).optional(),
  Thursday: Joi.string().allow(null).optional(),
  ThursdayEnd: Joi.string().allow(null).optional(),
  Friday: Joi.string().allow(null).optional(),
  FridayEnd: Joi.string().allow(null).optional(),
  Saturday: Joi.string().allow(null).optional(),
  SaturdayEnd: Joi.string().allow(null).optional(),
  Sunday: Joi.string().allow(null).optional(),
  SundayEnd: Joi.string().allow(null).optional(),
  IsActive: Joi.number().valid(0, 1).default(0),
});

const portfolioSchema = Joi.object({
  StudentID: Joi.number().integer().required(),
  Description: Joi.string().allow(null),
  Score: Joi.number().integer(),
  Scoredetail: Joi.string().allow(null),
  ScoreDateTime: Joi.date().allow(null),
});

const profileUpdateSchema = Joi.object({
  UserID: Joi.number().integer().positive(),
  FirstName: Joi.string().optional(),
  LastName: Joi.string().optional(),
  Email: Joi.string().optional(),
  PhoneNumber: Joi.string().allow(null, ""),
  Password: Joi.string().optional(),
  IsNCourseExNewsProm: Joi.number().valid(0, 1).default(0).optional(),
  IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
  IsActive: Joi.number().valid(0, 1).default(0),
  TeamOrCompanyName: Joi.string().optional(),
  TeamMember: Joi.number().default(0).optional(),
  IsParticipateCompetitions: Joi.number().valid(0, 1).default(0).optional(),
  IsNoSuPeAchPoQu: Joi.number().valid(0, 1).default(0).optional(),
  AccountType: Joi.string().valid("1", "2", "3").optional(),
  Grade: Joi.string().optional(),
});

const validateStudentAvailable = Joi.object({
  StudentID: Joi.number().integer().positive().required(),
  StartDate: Joi.date().required(),
  weekData: Joi.array().items(
    Joi.object().pattern(
      Joi.string().valid(
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ), 
      Joi.string()
        .required() // Time in HH:MM format as values
    ).required()
  ).required(),
});

module.exports = {
  flowSchema,
  loginSchema,
  contactusSchema,
  parentSchema,
  parentUpdateSchema,
  studentSchema,
  studentUpdateSchema,
  companySchema,
  companyUpdateSchema,
  portfolioSchema,
  profileUpdateSchema,
  validateStudentAvailable
};

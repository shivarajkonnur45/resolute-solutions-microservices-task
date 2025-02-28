
const Joi = require('joi');

const adminSchema = Joi.object({
    FirstName: Joi.string().max(256).required(),
    LastName: Joi.string().max(256).required(),
    Email: Joi.string().required(),
    Password: Joi.string().required(),
    PhoneNumber: Joi.string().allow(null, ''),
    AccountID: Joi.string().allow(null),
    AccountType: Joi.string().valid('1', '2', '3', '4', '5').required(),
    StaffPermission: Joi.string().valid('1', '0').required(),
    ParentID: Joi.number().integer().min(0).allow(null),
    IsActive: Joi.number().valid(0, 1).default(0),
});
const adminUpdateSchema = Joi.object({
    FirstName: Joi.string().max(256).optional(),
    LastName: Joi.string().max(256).optional(),
    Email: Joi.string().optional(),
    Password: Joi.string().optional(),
    PhoneNumber: Joi.string().allow(null, ''),
    AccountID: Joi.string().allow(null),
    AccountType: Joi.string().valid('1', '2', '3', '4', '5').optional(),
    StaffPermission: Joi.string().valid('1', '0').optional(),
    ParentID: Joi.number().integer().min(0).allow(null),
    IsActive: Joi.number().valid(0, 1).default(0),
});


const loginSchema = Joi.object({
    Email: Joi.string().max(256),
    Password: Joi.string().max(512),
});

const competitionSchema = Joi.object({
    Grade: Joi.string().allow(null),
    Format: Joi.string().valid('In-person', 'Online').required(),
    CompetitionTitle: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .required()
        .messages({
            'string.pattern.base': 'CompetitionTitle must not contain special characters',
        }),
    CompetitionDescription: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'CompetitionDescription must not contain special characters',
        }),
    CompetitionRequirements: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'CompetitionRequirements must not contain special characters',
        }),
    CompetitionReason: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'Why should you join must not contain special characters',
        }),
    FirstPrize: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'FirstPrize must not contain special characters',
        }),
    SecondPrize: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'SecondPrize must not contain special characters',
        }),
    ThirdPrize: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'ThirdPrize must not contain special characters',
        }),
    StartDate: Joi.date().required(),
    EndDate: Joi.date().required(),
    WinnerAnnouncementDate: Joi.date().required(),
    ImgFile: Joi.string().allow(null),
    VideoFile: Joi.string().allow(null),
    SubtitleFile: Joi.string().allow(null),
    filesname: Joi.string().allow(null).optional().empty(''),
    IsActive: Joi.number().valid(0, 1).default(0),
});

const competitionUpdateSchema = Joi.object({
    Grade: Joi.string().allow(null).optional(),
    Format: Joi.string().valid('In-person', 'Online').optional(),
    CompetitionTitle: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .optional()
        .messages({
            'string.pattern.base': 'CompetitionTitle must not contain special characters',
        }),
    CompetitionDescription: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .allow(null)
        .messages({
            'string.pattern.base': 'CompetitionDescription must not contain special characters',
        }),
    CompetitionRequirements: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .allow(null)
        .messages({
            'string.pattern.base': 'CompetitionRequirements must not contain special characters',
        }),
    CompetitionReason: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'Why should you join must not contain special characters',
        }),
    FirstPrize: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .allow(null)
        .messages({
            'string.pattern.base': 'FirstPrize must not contain special characters',
        }),
    SecondPrize: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .allow(null)
        .messages({
            'string.pattern.base': 'SecondPrize must not contain special characters',
        }),
    ThirdPrize: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .allow(null)
        .messages({
            'string.pattern.base': 'ThirdPrize must not contain special characters',
        }),
    StartDate: Joi.date().optional(),
    EndDate: Joi.date().optional(),
    WinnerAnnouncementDate: Joi.date().required(),
    ImgFile: Joi.string().allow(null),
    VideoFile: Joi.string().allow(null),
    SubtitleFile: Joi.string().allow(null),
    filesname: Joi.string().allow(null).optional().empty(''),
    IsActive: Joi.number().valid(0, 1).default(0),
});


const courseSchema = Joi.object({
    courseCategory: Joi.string().required().max(256),
    courseGrade: Joi.string().allow(null),
    courseTag: Joi.string().allow(null),
    courseTitle: Joi.string().required().max(256),
    courseDesc: Joi.string().allow(null),
    courseImage: Joi.string().allow(null),
    courseVideo: Joi.string().allow(null),
    courseSubtitle: Joi.string().allow(null),
    certificateTitle: Joi.string().allow(null),
    certificateImage: Joi.string().allow(null),
    CourseModule: Joi.array().items(Joi.object({
        Title: Joi.string().required().min(3).max(256),
        Description: Joi.string().allow(null),
        position: Joi.number().integer().min(0).required(),
    })),
    trophyTitle: Joi.string().allow(null),
    trophyDesc: Joi.string().allow(null),
    trophyImage: Joi.string().allow(null),
    IsActive: Joi.number().valid(0, 1).default(0),
    isValid: Joi.string().valid('0', '1').default('0'),
});

const lessonSchema = Joi.object({
    Title: Joi.string().required(),
    Description: Joi.string().allow(null),
    IsActive: Joi.number().valid(0, 1).default(0),
    LessonTopic: Joi.array().items(Joi.object({
        Title: Joi.string().required(),
        Transcript: Joi.string().allow(null),
        position: Joi.number().integer().required(),
    })),
    LessonBadge: Joi.array().items(Joi.object({
        Title: Joi.string().required(),
        Description: Joi.string().allow(null),
        position: Joi.number().integer().required(),
    })),
    LessonPortfolio: Joi.array().items(Joi.object({
        Title: Joi.string().required(),
        Description: Joi.string().allow(null),
        Transcript: Joi.string().allow(null),
        position: Joi.number().integer().required(),
    })),
    LessonQuiz: Joi.array().items(Joi.object({
        Answers: Joi.array().items(Joi.string().required()),
        QuizFormat: Joi.string().allow(null),
        Question: Joi.string().required(),
        RightAnswer: Joi.number().integer().required(),
    })),
    position: Joi.number().integer().required(),
    moduleId: Joi.string().required(),
    lessonImage: Joi.string().allow(''),
    lessonVideo: Joi.string().allow(''),
    lessonSubtitle: Joi.string().allow(''),
});

const parentSchema = Joi.object({
    FirstName: Joi.string().required(),
    LastName: Joi.string().required(),
    Email: Joi.string().required(),
    PhoneNumber: Joi.string().allow(null, ''),
    Password: Joi.string().required(),
    IsNoSuPeAchPoQu: Joi.number().valid(0, 1).default(0).optional(),
    IsNCourseExNewsProm: Joi.number().valid(0, 1).default(0).optional(),
    IsLookFeedback: Joi.number().valid(0, 1).default(0),
    IsActive: Joi.number().valid(0, 1).default(0),
    newCreateReq: Joi.boolean().optional()
});
const parentUpdateSchema = Joi.object({
    FirstName: Joi.string().optional(),
    LastName: Joi.string().optional(),
    Email: Joi.string().optional(),
    PhoneNumber: Joi.string().allow(null, ''),
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
    PhoneNumber: Joi.string().allow(null, ''),
    Password: Joi.string().required(),
    IsParticipateCompetitions: Joi.number().valid(0, 1).default(0).optional(),
    IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
    ParentID: Joi.number().required(),
    IsActive: Joi.number().valid(0, 1).default(0),
});
const studentUpdateSchema = Joi.object({
    Grade: Joi.string().allow(null).optional(),
    FirstName: Joi.string().optional(),
    LastName: Joi.string().optional(),
    Email: Joi.string().optional(),
    PhoneNumber: Joi.string().allow(null, ''),
    Password: Joi.string().optional(),
    IsParticipateCompetitions: Joi.number().valid(0, 1).default(0).optional(),
    IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
    ParentID: Joi.number(),
    IsActive: Joi.number().valid(0, 1).default(0),
});

const companySchema = Joi.object({
    FirstName: Joi.string().required(),
    LastName: Joi.string().required(),
    Email: Joi.string().required(),
    PhoneNumber: Joi.string().allow(null, ''),
    Password: Joi.string().required(),
    IsNCourseExNewsProm: Joi.number().valid(0, 1).default(0).optional(),
    IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
    IsActive: Joi.number().valid(0, 1).default(0),
    TeamOrCompanyName: Joi.string().optional(),
    TeamMember: Joi.number().default(0).optional(),
    visualNotificationBody: Joi.object({

    }).optional()
});
const companyUpdateSchema = Joi.object({
    FirstName: Joi.string().optional(),
    LastName: Joi.string().optional(),
    Email: Joi.string().optional(),
    PhoneNumber: Joi.string().allow(null, ''),
    Password: Joi.string().optional(),
    IsNCourseExNewsProm: Joi.number().valid(0, 1).default(0).optional(),
    IsLookFeedback: Joi.number().valid(0, 1).default(0).optional(),
    IsActive: Joi.number().valid(0, 1).default(0),
    TeamOrCompanyName: Joi.string().optional(),
    TeamMember: Joi.number().default(0).optional(),
});

const helpSchema = Joi.object({
    AccountType: Joi.string().valid('2', '3').required(),
    Title: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .required()
        .messages({
            'string.pattern.base': 'Title must not contain special characters',
        }),
    Description: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'Description must not contain special characters',
        }),
    Category: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .allow(null)
        .messages({
            'string.pattern.base': 'Category must not contain special characters',
        }),
    ImgFile: Joi.string().allow(null),
    VideoFile: Joi.string().allow(null),
    SubtitleFile: Joi.string().allow(null),
    filesname: Joi.string().allow(null).optional().empty(''),
    IsActive: Joi.number().valid(0, 1).default(0),
});

const helpUpdateSchema = Joi.object({
    AccountType: Joi.string().valid('2', '3').optional(),
    Title: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .optional()
        .messages({
            'string.pattern.base': 'Title must not contain special characters',
        }),
    Description: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .allow(null)
        .messages({
            'string.pattern.base': 'Description must not contain special characters',
        }).optional(),
    Category: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9 ]*$'))
        .allow(null)
        .messages({
            'string.pattern.base': 'Category must not contain special characters',
        }).optional(),
    ImgFile: Joi.string().allow(null).optional(),
    VideoFile: Joi.string().allow(null).optional(),
    SubtitleFile: Joi.string().allow(null).optional(),
    filesname: Joi.string().allow(null).optional().empty(''),
    IsActive: Joi.number().valid(0, 1).default(0),
});

const PromotionSchema = Joi.object({
    PromotionTitle: Joi.string().max(120).allow(null).optional().empty(''),
    AccountType: Joi.string().max(120).valid('Company', 'Parent', 'Student').required(),
    CTA: Joi.string().max(30).allow(null).optional().empty(''),
    MembershipBannerTitle: Joi.string().max(120).allow(null).optional().empty(''),
    MembershipBannerCTA: Joi.string().max(30).allow(null).optional().empty(''),
    MembershipBannerTag: Joi.string().max(255).allow(null).optional().empty(''),
    MembershipReferralTitle: Joi.string().max(120).allow(null).optional().empty(''),
    MembershipReferralCTA: Joi.string().max(30).allow(null).optional().empty(''),
    MembershipReferralTag: Joi.string().max(255).allow(null).optional().empty(''),
    MembershipReferralDescription: Joi.string().max(255).allow(null).optional().empty(''),
    ImgFile: Joi.string().allow(null).optional().empty(''),
    VideoFile: Joi.string().allow(null).optional().empty(''),
    SubtitleFile: Joi.string().allow(null).optional().empty(''),
    IsActive: Joi.number().valid(0, 1).default(0),
    PromotionCarousel: Joi.array().items(Joi.object({
        Title: Joi.string().max(120).allow(null).optional().empty(''),
        Description: Joi.string().max(300).allow(null).optional().empty(''),
        CTA: Joi.string().max(255).allow(null).optional().empty(''),
        ImgFile: Joi.string().allow(null).optional().empty(''),
        VideoFile: Joi.string().allow(null).optional().empty(''),
        SubtitleFile: Joi.string().allow(null).optional().empty(''),
    })),
    PromotionVideo: Joi.array().items(Joi.object({
        VideoColletionTitle: Joi.string().max(120).allow(null).optional().empty(''),
        Title: Joi.string().max(120).allow(null).optional().empty(''),
        Description: Joi.string().max(300).allow(null).optional().empty(''),
        CTA: Joi.string().max(255).allow(null).optional().empty(''),
        ImgFile: Joi.string().allow(null).optional().empty(''),
        VideoFile: Joi.string().allow(null).optional().empty(''),
        SubtitleFile: Joi.string().allow(null).optional().empty(''),
    })),
    PromotionOnboardingVideo: Joi.array().items(Joi.object({
        DeviceType: Joi.string().max(120).valid('Desktop', 'Tablet', 'Mobile').allow(null).optional().empty(''),
        Title: Joi.string().max(120).allow(null).optional().empty(''),
        Description: Joi.string().max(300).allow(null).optional().empty(''),
        CTA: Joi.string().max(255).allow(null).optional().empty(''),
        ImgFile: Joi.string().allow(null).optional().empty(''),
        VideoFile: Joi.string().allow(null).optional().empty(''),
        SubtitleFile: Joi.string().allow(null).optional().empty(''),
    })),
});

const reflectionSchema = Joi.object({
    Author: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .required()
        .messages({
            'string.pattern.base': 'Author must not contain special characters in Sequence',
        }),
    Quote: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .required()
        .messages({
            'string.pattern.base': 'Quote must not contain special characters in Sequence',
        }),
    IsActive: Joi.number().valid(0, 1).default(0),
});
const reflectionUpdateSchema = Joi.object({
    Author: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .optional()
        .messages({
            'string.pattern.base': 'Author must not contain special characters in Sequence',
        }),
    Quote: Joi.string()
        .pattern(new RegExp(/^(?!.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\\-\/]{3}).*$/))
        .optional()
        .messages({
            'string.pattern.base': 'Quote must not contain special characters in Sequence',
        }),
});


module.exports = {
    adminSchema,
    adminUpdateSchema,
    competitionSchema,
    competitionUpdateSchema,
    loginSchema,
    courseSchema,
    lessonSchema,
    parentSchema,
    parentUpdateSchema,
    studentSchema,
    studentUpdateSchema,
    companySchema,
    companyUpdateSchema,
    helpSchema,
    helpUpdateSchema,
    PromotionSchema,
    reflectionSchema,
    reflectionUpdateSchema
};


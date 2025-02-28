const { CourseModel, Module, Lesson, lessontopic, lessonbadge, lessonportfolio, lessonquiz, CourseCategory, coursehistory, LessonHistory, ModuleHistory, lessontopicHistory, lessonbadgeHistory, lessonportfolioHistory, lessonquizHistory } = require('../models/index');

//! Lesson delete --START-->>

async function deleteLessons(req, res) {
    // const t = await sequelize.transaction();
    try {
        const { LessonID } = req.params;
        if (!LessonID) {
            return res.status(404).json({
                message: "Lesson not found"
            })
        }
        else {
            // Maintain History Table 
            let existingLessonsData = await Lesson.findOne({ where: { LessonID: LessonID } });

            if (existingLessonsData) {
                const createdHistoryData = await LessonHistory.create(existingLessonsData.dataValues, );
                if (!createdHistoryData) {
                    // await t.rollback();
                    return res.status(400).send({ message: "Failed to create history entry" });
                }
            };
            // History Table end

            const lessonData = await Lesson.update({ isActive: "2" }, { where: { LessonID: LessonID } });

            if (!lessonData) {
                // await t.rollback();
                return res.status(404).json({
                    message: "Lesson not found"
                })
            }
            else {
                // Maintain Lesson Topic History Table 
                let existingLessonTopicData = await lessontopic.findOne({ where: { LessonID: LessonID } });

                if (existingLessonTopicData) {
                    const createdLessonTopicHistoryData = await lessontopicHistory.create(existingLessonTopicData.dataValues, );
                    if (!createdLessonTopicHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Topic Table end

                await lessontopic.update({ isActive: "2" }, { where: { LessonID: LessonID } });

                // Maintain Lesson Badge History Table 
                let existingLessonBadgeData = await lessonbadge.findOne({ where: { LessonID: LessonID } });

                if (existingLessonBadgeData) {
                    const createdLessonBadgeHistoryData = await lessonbadgeHistory.create(existingLessonBadgeData.dataValues, );
                    if (!createdLessonBadgeHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Badge Table end

                await lessonbadge.update({ isActive: "2" }, { where: { LessonID: LessonID } });


                // Maintain Lesson Portfolio History Table 
                let existingLessonPortfolioData = await lessonportfolio.findOne({ where: { LessonID: LessonID } });

                if (existingLessonPortfolioData) {
                    const createdLessonPortfolioHistoryData = await lessonportfolioHistory.create(existingLessonPortfolioData.dataValues, );
                    if (!createdLessonPortfolioHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Portfolio Table end

                await lessonportfolio.update({ isActive: "2" }, { where: { LessonID: LessonID } });


                // Maintain Lesson Quiz History Table 
                let existingLessonQuizData = await lessonquiz.findOne({ where: { LessonID: LessonID } });
                // console.log(existingLessonQuizData);

                if (existingLessonQuizData) {
                    const createdLessonQuizHistoryData = await lessonquizHistory.create(existingLessonQuizData.dataValues, );
                    if (!createdLessonQuizHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Quiz Table end

                await lessonquiz.update({ isActive: "2" }, { where: { LessonID: LessonID } });
                // await t.commit();
                return res.status(200).json({
                    message: "Lesson Deleted Successfully"
                })
            }
        }
    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(500).json({
            message: "Sorry! there was an server-side error"
        })
    }
}

//! Lesson Delete --END-->>

//! Lesson parts (BADGE, PORTFOLIO, TOPIC, QUIZ) Delete --STARTS-->>
async function deleteLessonsParts(req, res) {
    // const t = await sequelize.transaction();
    try {
        if (Object.keys(req.body)[0] === "LessonBadge") {
            // Maintain Lesson Badge History Table 
            let existingLessonBadgeData = await lessonbadge.findOne({ where: { LessonID: req.body.LessonBadge } });

            if (existingLessonBadgeData) {
                const createdLessonBadgeHistoryData = await lessonbadgeHistory.create(existingLessonBadgeData.dataValues, );
                if (!createdLessonBadgeHistoryData) {
                    // await t.rollback();
                    return res.status(400).send({ message: "Failed to create history entry" });
                }
            };
            // History Lesson Badge Table end

            await lessonbadge.update({ isActive: "2" }, { where: { LessonBadgeID: req.body.LessonBadge } });
        }
        if (Object.keys(req.body)[0] === "LessonPortfolio") {
            // Maintain Lesson Portfolio History Table 
            let existingLessonPortfolioData = await lessonportfolio.findOne({ where: { LessonID: req.body.LessonPortfolio } });

            if (existingLessonPortfolioData) {
                const createdLessonPortfolioHistoryData = await lessonportfolioHistory.create(existingLessonPortfolioData.dataValues, );
                if (!createdLessonPortfolioHistoryData) {
                    // await t.rollback();
                    return res.status(400).send({ message: "Failed to create history entry" });
                }
            };
            // History Lesson Portfolio Table end

            await lessonportfolio.update({ isActive: "2" }, { where: { LessonPortfolioID: req.body.LessonPortfolio } });
        }
        if (Object.keys(req.body)[0] === "LessonTopic") {
            // Maintain Lesson Topic History Table 
            let existingLessonTopicData = await lessontopic.findOne({ where: { LessonID: req.body.LessonTopic } });

            if (existingLessonTopicData) {
                const createdLessonTopicHistoryData = await lessontopicHistory.create(existingLessonTopicData.dataValues, );
                if (!createdLessonTopicHistoryData) {
                    // await t.rollback();
                    return res.status(400).send({ message: "Failed to create history entry" });
                }
            };
            // History Lesson Topic Table end

            await lessontopic.update({ isActive: "2" }, { where: { LessonTopicID: req.body.LessonTopic } });
        }
        if (Object.keys(req.body)[0] === "LessonQuiz") {
            // Maintain Lesson Quiz History Table 
            let existingLessonQuizData = await lessonquiz.findOne({ where: { LessonID: req.body.LessonQuiz } });

            if (existingLessonQuizData) {
                const createdLessonQuizHistoryData = await lessonquizHistory.create(existingLessonQuizData.dataValues, );
                if (!createdLessonQuizHistoryData) {
                    // await t.rollback();
                    return res.status(400).send({ message: "Failed to create history entry" });
                }
                return res.status(400).send({ message: "Lesson Quiz Data not found" });
            };
            // History Lesson Quiz Table end

            await lessonquiz.update({ isActive: "2" }, { where: { LessonQuizID: req.body.LessonQuiz } });
        }
        // await t.commit();
        return res.status(200).json({
            message: "Deleted Successfully"
        })
    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(500).json({
            message: "Sorry! there was an server-side error"
        })
    }
}
//! Lesson parts (BADGE, PORTFOLIO, TOPIC, QUIZ) Delete --END-->>

//! Module Delete Parts ---Start--->>

async function deleteModule(req, res) {
    // const t = await sequelize.transaction();
    try {
        const { ModuleID } = req.params;
        if (!ModuleID) {
            return res.status(404).json({
                message: "Module not found"
            })
        }
        else {

            // Maintain History Table 
            let existingModuleData = await Module.findOne({ where: { ModuleID: ModuleID } });

            if (existingModuleData) {
                const createdHistoryData = await ModuleHistory.create(existingModuleData.dataValues, );
                if (!createdHistoryData) {
                    return res.status(400).send({ message: "Failed to create history entry" });
                }
            };
            // History Table end


            const moduleData = await Module.update({ isActive: "2" }, { where: { ModuleID: ModuleID } });

            if (!moduleData) {
                // await t.rollback();
                return res.status(404).json({
                    message: "Module not found"
                })
            }
            else {
                // Maintain Lesson History Table
                let existingLessonsData = await Lesson.findOne({ where: { ModuleID: ModuleID } });

                if (existingLessonsData) {
                    const createdHistoryData = await LessonHistory.create(existingLessonsData.dataValues, );
                    if (!createdHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Table End
                await Lesson.update({ isActive: "2" }, { where: { ModuleID: ModuleID } });

                // Maintain Lesson Topic History Table 
                let existingLessonTopicData = await lessontopic.findOne({ where: { ModuleID: ModuleID } });

                if (existingLessonTopicData) {
                    const createdLessonTopicHistoryData = await lessontopicHistory.create(existingLessonTopicData.dataValues, );
                    if (!createdLessonTopicHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Topic Table end
                await lessontopic.update({ isActive: "2" }, { where: { ModuleID: ModuleID } });

                // Maintain Lesson Badge History Table 
                let existingLessonBadgeData = await lessonbadge.findOne({ where: { ModuleID: ModuleID } });

                if (existingLessonBadgeData) {
                    const createdLessonBadgeHistoryData = await lessonbadgeHistory.create(existingLessonBadgeData.dataValues, );
                    if (!createdLessonBadgeHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Badge Table end
                await lessonbadge.update({ isActive: "2" }, { where: { ModuleID: ModuleID } });

                // Maintain Lesson Portfolio History Table 
                let existingLessonPortfolioData = await lessonportfolio.findOne({ where: { ModuleID: ModuleID } });

                if (existingLessonPortfolioData) {
                    const createdLessonPortfolioHistoryData = await lessonportfolioHistory.create(existingLessonPortfolioData.dataValues, );
                    if (!createdLessonPortfolioHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Portfolio Table end
                await lessonportfolio.update({ isActive: "2" }, { where: { ModuleID: ModuleID } });

                // Maintain Lesson Quiz History Table 
                let existingLessonQuizData = await lessonquiz.findOne({ where: { ModuleID: ModuleID } });

                if (existingLessonQuizData) {
                    const createdLessonQuizHistoryData = await lessonquizHistory.create(existingLessonQuizData.dataValues, );
                    if (!createdLessonQuizHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                    // await t.rollback();
                  
                };
                // History Lesson Quiz Table end
                await lessonquiz.update({ isActive: "2" }, { where: { ModuleID: ModuleID } });
                // await t.commit();
                return res.status(200).json({
                    message: "Deleted Successfully"
                })
            }
        }
    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(500).json({
            message: "Sorry! there was an server-side error"
        })
    }
}

//! Module Delete Parts ---End--->>

//! Course Delete Parts ---Start--->>

async function deleteFullCourse(req, res) {
    // const t = await sequelize.transaction();
    try {
        const { CourseID } = req.params;
        if (!CourseID) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        else {
            // Maintain History Table 
            const GetCourseData = await CourseModel.findOne({ where: { courseId: CourseID } });
            if (GetCourseData) {
                const CreateCourseHistoryData = await coursehistory.create(GetCourseData.dataValues, );
                if (!CreateCourseHistoryData) {
                    // await t.rollback();
                    return res.status(400).send({ message: "Course Data Not insert in History Table" });
                };
            };
            // History Table end

            const courseData = await CourseModel.update({ isActive: "2" }, { where: { courseId: CourseID } });

            if (!courseData) {
                // await t.rollback();
                return res.status(404).json({
                    message: "Course not found"
                })
            }
            else {
                // Maintain Module History Table 
                let existingModuleData = await Module.findOne({ where: { courseId: CourseID } });
                if (existingModuleData) {
                    const createdHistoryData = await ModuleHistory.create(existingModuleData.dataValues, );
                    if (!createdHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create history entry" });
                    }
                };
                // History Module Table end
                await Module.update({ isActive: "2" }, { where: { courseId: CourseID } });

                // Maintain Lesson History Table
                let existingLessonsData = await Lesson.findOne({ where: { courseId: CourseID } });

                if (existingLessonsData) {
                    const createdHistoryData = await LessonHistory.create(existingLessonsData.dataValues, );
                    if (!createdHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Table End
                await Lesson.update({ isActive: "2" }, { where: { courseId: CourseID } });

                // Maintain Lesson Topic History Table 
                let existingLessonTopicData = await lessontopic.findOne({ where: { courseId: CourseID } });

                if (existingLessonTopicData) {
                    const createdLessonTopicHistoryData = await lessontopicHistory.create(existingLessonTopicData.dataValues, );
                    if (!createdLessonTopicHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Topic Table end
                await lessontopic.update({ isActive: "2" }, { where: { courseId: CourseID } });

                // Maintain Lesson Badge History Table 
                let existingLessonBadgeData = await lessonbadge.findOne({ where: { courseId: CourseID } });

                if (existingLessonBadgeData) {
                    const createdLessonBadgeHistoryData = await lessonbadgeHistory.create(existingLessonBadgeData.dataValues, );
                    if (!createdLessonBadgeHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Badge Table end
                await lessonbadge.update({ isActive: "2" }, { where: { courseId: CourseID } });

                // Maintain Lesson Portfolio History Table 
                let existingLessonPortfolioData = await lessonportfolio.findOne({ where: { courseId: CourseID } });

                if (existingLessonPortfolioData) {
                    const createdLessonPortfolioHistoryData = await lessonportfolioHistory.create(existingLessonPortfolioData.dataValues, );
                    if (!createdLessonPortfolioHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                };
                // History Lesson Portfolio Table end
                await lessonportfolio.update({ isActive: "2" }, { where: { courseId: CourseID } });

                // Maintain Lesson Quiz History Table 
                let existingLessonQuizData = await lessonquiz.findOne({ where: { courseId: CourseID } });

                if (existingLessonQuizData) {
                    const createdLessonQuizHistoryData = await lessonquizHistory.create(existingLessonQuizData.dataValues, );
                    if (!createdLessonQuizHistoryData) {
                        // await t.rollback();
                        return res.status(400).send({ message: "Failed to create history entry" });
                    }
                    return res.status(400).send({ message: "Lesson Quiz Data not found" });
                };
                // History Lesson Quiz Table end
                await lessonquiz.update({ isActive: "2" }, { where: { courseId: CourseID } });
                // await t.commit();
                return res.status(200).json({
                    message: "Deleted Successfully"
                })
            }
        }
    } catch (error) {
        // await t.rollback();
        console.log(error);
        res.status(500).json({
            message: "Sorry! there was an server-side error"
        })
    }
}

//! Course Delete Parts ---End--->>
module.exports = { deleteLessons, deleteLessonsParts, deleteModule, deleteFullCourse };
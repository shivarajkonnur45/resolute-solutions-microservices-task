const {
    promotion,
    promotionhistory,
    promotioncarousel,
    promotioncarouselhistory,
    promotionvideo,
    promotionvideohistory,
    promotiononboardingvideo,
    promotiononboardingvideohistory,
} = require("../models/index");

const Sequelize = require("sequelize");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const PromotionCarouselModel = require("../models/PromotionCarouselModel");
const { log } = require("util");
const { request } = require("http");

const asyncFfmpegHandler = require("../helpers/getVideoDuration");
const videoDir = path.join(__dirname, "..", "/volume/Video/");





const GetPromotionsRequest = async (req, res) => {
    try {
        // if (req.token.AccountType !== "4") {
        //     return res.status(404).json({ message: "Login With Admin Email And Password." });
        // }

        let { AccountType } = req.query;

        const whereCondition = AccountType ? { AccountType: AccountType } : {};

        const promotions = await promotion.findAll({
            where: whereCondition,
            order: [['PromotionID', 'DESC']],
            include: [{
                model: promotioncarousel,
                as: 'promotioncarousel'
            }, {
                model: promotionvideo,
                as: 'promotionvideo'
            }, {
                model: promotiononboardingvideo,
                as: 'promotiononboardingvideo',
            }]
        });

        if (promotions && promotions.length > 0) {
            return res.status(200).json({
                Data: promotions,
            });
        } else {
            return res.status(400).json({ Data: "Promotion Data Not Found!" });
        }
    } catch (error) {
        return res.status(400).json({
            ErrorCode: "REQUEST",
            message: error.message,
            Error: error,
        });
    }
}
const GetPromotionRequest = async (req, res) => {
    try {
        const { AccDetails } = req;

        // if (AccDetails.AccountType !== "4") {
        //     return res.status(404).json({ message: "Login With Admin Email And Password." });
        // }
        const id = req.params.id;
        const GetPromotionData = await promotion.findOne({
            where: { PromotionID: id },

            include: [{
                model: promotioncarousel,
                as: 'promotioncarousel'
            }, {
                model: promotionvideo,
                as: 'promotionvideo'
            }, {
                model: promotiononboardingvideo,
                as: 'promotiononboardingvideo',
            }]
        });
        if (GetPromotionData) {
            return res.status(200).json({
                TotalCount: GetPromotionData.length,
                Data: GetPromotionData,
            });
        } else {
            return res.status(400).json({ Data: "Promotion Data Not Gets!" });
        }
    } catch (error) {
        return res
            .status(400)
            .json({
                ErrorCode: "REQUEST",
                message: error.message,
                Error: error,
            });
    }
};


const UpdateRequest = async (req, res, next) => {
    try {
        const { AccDetails } = req;
        const id = req.params.id;
        const result = req.body;
        //! Maintain History Table 
        let existingPromotionData = await promotion.findOne({ where: { PromotionID: id } });

        if (existingPromotionData) {
            const createdHistoryData = await promotionhistory.create(existingPromotionData.dataValues);
            if (!createdHistoryData) {
                return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create history entry" });
            }
        };
        //! History Table end
        // Update promotion data
        const updatePromotion = await promotion.update(
            {
                CTA: result.CTA ?? undefined,
                PromotionTitle: result.PromotionTitle ?? undefined,
                AccountType: existingPromotionData.AccountType ?? undefined,
                MembershipBannerTitle: result.MembershipBannerTitle ?? undefined,
                MembershipBannerCTA: result.MembershipBannerCTA ?? undefined,
                MembershipBannerTag: result.MembershipBannerTag ?? undefined,
                MembershipReferralTitle: result.MembershipReferralTitle ?? undefined,
                MembershipReferralCTA: result.MembershipReferralCTA ?? undefined,
                MembershipReferralTag: result.MembershipReferralTag ?? undefined,
                MembershipReferralDescription: result.MembershipReferralDescription ?? undefined,
                IsActive: result.IsActive ?? undefined,
                CreatedBy: AccDetails.FirstName,
                LastModifiedBy: AccDetails.FirstName,
            },
            { where: { PromotionID: id } }
        );

        if (!updatePromotion) {
            return res.status(400).json({
                ErrorCode: "REQUEST",
                message: "Failed to update promotion data",
            });
        }


        const Ct = req?.Ct; // CarouselThumbnail
        const PvT = req?.PvT; // PromotionVideoThumbnail
        const OvT = req?.OvT; // PromotionOnboeadingVideoThumbnail

        const Cv = req?.Cv; // CarouselVideo
        const PvV = req?.PvV; // PromotionVideoVideo
        const OvV = req?.OvV; // PromotionOnboeadingVideoVideo

        const Cs = req?.Cs; // CarouselSubtitle
        const PvS = req?.PvS; // PromotionVideoSubtitle
        const OvS = req?.OvS; // PromotionOnboeadingVideoSubtitle

     

        if (result.DeleteFiles) {
            const deleteFiles = JSON.parse(result.DeleteFiles);
            await Promise.all(deleteFiles.map(async (file) => {
                let folderPath;
                if (file.filesname.startsWith('CarouselThumbnail') || file.filesname.startsWith('PromotionVideoThumbnail') || file.filesname.startsWith('OnboardingVideoThumbnail')) {
                    folderPath = path.join(__dirname, '..', 'Thumbnail');
                } else if (file.filesname.startsWith('CarouselVideo') || file.filesname.startsWith('PromotionVideoVideo') || file.filesname.startsWith('OnboardingVideoVideo')) {
                    folderPath = path.join(__dirname, '..', 'Video');
                } else if (file.filesname.startsWith('CarouselSubtitle') || file.filesname.startsWith('PromotionVideoSubtitle') || file.filesname.startsWith('OnboardingVideoSubtitle')) {
                    folderPath = path.join(__dirname, '..', 'Subtitle');
                }

                if (folderPath) {
                    const filePath = path.join(folderPath, file.filesname);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }

                    switch (file.modulename) {
                        case "promotioncarouselfiles":
                            if (folderPath.endsWith('Thumbnail')) {
                                await promotioncarousel.update({ ImgFile: null, PromotionCarouselID: file.id }, { where: { PromotionCarouselID: file.id } });
                            } else if (folderPath.endsWith('Video')) {
                                await promotioncarousel.update({ VideoFile: null, PromotionCarouselID: file.id }, { where: { PromotionCarouselID: file.id } });
                            } else if (folderPath.endsWith('Subtitle')) {
                                await promotioncarousel.update({ SubtitleFile: null, PromotionCarouselID: file.id }, { where: { PromotionCarouselID: file.id } });
                            }
                            break;
                        case "promotionvideofiles":
                            if (folderPath.endsWith('Thumbnail')) {
                                await promotionvideo.update({ ImgFile: null, PromotionVideoID: file.id }, { where: { PromotionVideoID: file.id } });
                            } else if (folderPath.endsWith('Video')) {
                                await promotionvideo.update({ VideoFile: null, PromotionVideoID: file.id }, { where: { PromotionVideoID: file.id } });
                            } else if (folderPath.endsWith('Subtitle')) {
                                await promotionvideo.update({ SubtitleFile: null, PromotionVideoID: file.id }, { where: { PromotionVideoID: file.id } });
                            }
                            break;
                        case "promotiononboardingvideofiles":
                            if (folderPath.endsWith('Thumbnail')) {
                                await promotiononboardingvideo.update({ ImgFile: null, PromotionOnboardingVideoID: file.id }, { where: { PromotionOnboardingVideoID: file.id } });
                            } else if (folderPath.endsWith('Video')) {
                                await promotiononboardingvideo.update({ VideoFile: null, PromotionOnboardingVideoID: file.id }, { where: { PromotionOnboardingVideoID: file.id } });
                            } else if (folderPath.endsWith('Subtitle')) {
                                await promotiononboardingvideo.update({ SubtitleFile: null, PromotionOnboardingVideoID: file.id }, { where: { PromotionOnboardingVideoID: file.id } });
                            }
                            break;
                        default:
                            console.error("Unknown module name:", file.modulename);
                            break;
                    }

                }
            }));
        }


        if (result.PromotionCarousel) {

            const PromotionCarousel = JSON.parse(result.PromotionCarousel);

            if (PromotionCarousel.length > 0) {
                await Promise.all(PromotionCarousel.map(async (singleModule, index) => {
                    const parsedModule = singleModule;
                    // console.log(parsedModule);

                    if (parsedModule.PromotionCarouselID) {
                        //! Maintain History Table 
                        let existingCarouselData = await promotioncarousel.findOne({ where: { PromotionCarouselID: parsedModule.PromotionCarouselID } });

                        if (existingCarouselData) {
                            const createdHistoryData = await promotioncarouselhistory.create(existingCarouselData.dataValues);
                            if (!createdHistoryData) {
                                return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create history entry" });
                            }
                        };
                        //! History Table end


                        //! Module Testing Left out
                        const addedModule = await promotioncarousel.update({
                            Position: parsedModule.Position ?? undefined,
                            Title: parsedModule.Title ?? undefined,
                            Description: parsedModule.Description ?? undefined,
                            CTA: parsedModule.CTA ?? undefined,
                            Position: parsedModule.Position ?? undefined,
                            CreatedBy: AccDetails.FirstName,
                            LastModifiedBy: AccDetails.FirstName,
                        }, { where: { PromotionID: id, PromotionCarouselID: parsedModule.PromotionCarouselID } });

                        if (Ct && Ct.length > 0) {
                            // console.log(id, parsedModule.PromotionCarouselID);
                            let ctCheck = [];
                            await Promise.all(Ct.map(async (singleMt) => {
                                const splitMt = singleMt.split("_");

                                const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                ctCheck.push(indexMt);

                                // console.log(indexMt, parsedModule.Position);

                                if (indexMt == parsedModule.Position) {
                                    const aa = await promotioncarousel.update({ ImgFile: singleMt }, { where: { PromotionID: id, PromotionCarouselID: parsedModule.PromotionCarouselID } });

                                }
                            }));
                            if (!ctCheck.includes(parsedModule.Position.toString())) {
                                await promotioncarousel.update({ ImgFile: null }, { where: { PromotionID: id, PromotionCarouselID: parsedModule.PromotionCarouselID } });
                            }
                        }
                        // if (!Mt) {
                        //     await Module.update({ moduleImage: null }, { where: { ModuleID: parsedModule.CourseModuleID } });

                        // }
                        if (Cv && Cv.length > 0) {

                            let VMtCheck = [];
                            await Promise.all(Cv.map(async (singleVMt) => {
                                const splitVMt = singleVMt.split("_");
                                const indexVMt = splitVMt[splitVMt.length - 1].replace('.mp4', '');
                                VMtCheck.push(indexVMt);
                                if (indexVMt == parsedModule.Position) {
                                    const duration  = await asyncFfmpegHandler(`${videoDir}/${singleVMt}`);
                                    const aa = await promotioncarousel.update({ VideoFile: singleVMt, VideoFileLength: duration }, { where: { PromotionID: id, PromotionCarouselID: parsedModule.PromotionCarouselID } });
                                    
                                }
                            }));
                            if (!VMtCheck.includes(parsedModule.Position.toString())) {
                                await promotioncarousel.update({ VideoFile: null }, { where: { PromotionID: id, PromotionCarouselID: parsedModule.PromotionCarouselID } });

                            }
                        }

                        if (Cs && Cs.length > 0) {
                            let SmtCheck = [];
                            await Promise.all(Cs.map(async (singleSMt) => {
                                const splitSMt = singleSMt.split("_");
                                const indexSMt = splitSMt[splitSMt.length - 1].replace('.txt', '');
                                SmtCheck.push(indexSMt);
                                if (indexSMt == parsedModule.Position) {
                                    await promotioncarousel.update({ SubtitleFile: singleSMt }, { where: { PromotionID: id, PromotionCarouselID: parsedModule.PromotionCarouselID } });
                                }
                            }));
                            if (!SmtCheck.includes(parsedModule.Position.toString())) {
                                await promotioncarousel.update({ SubtitleFile: null }, { where: { PromotionID: id, PromotionCarouselID: parsedModule.PromotionCarouselID } });

                            }
                        }


                    }
                    else {


                        // Create a new promotion carousel entry
                        const newPromotionCarousel = await promotioncarousel.create({
                            PromotionID: id,
                            Title: parsedModule.Title ?? undefined,
                            Description: parsedModule.Description ?? undefined,
                            CTA: parsedModule.CTA ?? undefined,
                            Position: parsedModule.Position ?? undefined,
                            CreatedBy: AccDetails.FirstName,
                            LastModifiedBy: AccDetails.FirstName,
                        });

                        if (!newPromotionCarousel) {
                            return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create promotion carousel entry" });
                        }

                        // Handle file updates (ImgFile, VideoFile, SubtitleFile) similarly as in your update logic

                        // Example of handling ImgFile update for the new entry (adjust for VideoFile and SubtitleFile similarly)
                        if (Ct && Ct.length > 0) {
                            let ctCheck = [];
                            await Promise.all(Ct.map(async (singleMt) => {
                                const splitMt = singleMt.split("_");
                                const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                ctCheck.push(indexMt);

                                if (indexMt == parsedModule.Position) {


                                    await promotioncarousel.update({ ImgFile: singleMt }, { where: { PromotionID: id, PromotionCarouselID: newPromotionCarousel.PromotionCarouselID } });
                                }
                            }));

                            if (!ctCheck.includes(parsedModule.Position.toString())) {
                                await promotioncarousel.update({ ImgFile: null }, { where: { PromotionID: id, PromotionCarouselID: newPromotionCarousel.PromotionCarouselID } });
                            }
                        }

                        // Example of handling VideoFile update for the new entry
                        if (Cv && Cv.length > 0) {
                            let VMtCheck = [];
                            await Promise.all(Cv.map(async (singleVMt) => {
                                const splitVMt = singleVMt.split("_");
                                const indexVMt = splitVMt[splitVMt.length - 1].replace('.mp4', '');
                                VMtCheck.push(indexVMt);

                                if (indexVMt == parsedModule.Position) {


                                    await promotioncarousel.update({ VideoFile: singleVMt }, { where: { PromotionID: id, PromotionCarouselID: newPromotionCarousel.PromotionCarouselID } });
                                }
                            }));

                            if (!VMtCheck.includes(parsedModule.Position.toString())) {
                                await promotioncarousel.update({ VideoFile: null }, { where: { PromotionID: id, PromotionCarouselID: newPromotionCarousel.PromotionCarouselID } });
                            }
                        }

                        // Example of handling SubtitleFile update for the new entry
                        if (Cs && Cs.length > 0) {
                            let SmtCheck = [];
                            await Promise.all(Cs.map(async (singleSMt) => {
                                const splitSMt = singleSMt.split("_");
                                const indexSMt = splitSMt[splitSMt.length - 1].replace('.txt', '');
                                SmtCheck.push(indexSMt);

                                if (indexSMt == parsedModule.Position) {


                                    await promotioncarousel.update({ SubtitleFile: singleSMt }, { where: { PromotionID: id, PromotionCarouselID: newPromotionCarousel.PromotionCarouselID } });
                                }
                            }));

                            if (!SmtCheck.includes(parsedModule.Position.toString())) {
                                await promotioncarousel.update({ SubtitleFile: null }, { where: { PromotionID: id, PromotionCarouselID: newPromotionCarousel.PromotionCarouselID } });
                            }
                        }

                    }
                }))

            }

        }




        // Handle Promotion Video
        if (result.PromotionVideo) {
            const PromotionVideo = JSON.parse(result.PromotionVideo);

            if (PromotionVideo.length > 0) {
                await Promise.all(PromotionVideo.map(async (singleModule, index) => {
                    const parsedModule = singleModule;

                    if (parsedModule.PromotionVideoID) {
                        //! Maintain History Table 
                        let existingPromotionVideoData = await promotionvideo.findOne({ where: { PromotionVideoID: parsedModule.PromotionVideoID } });

                        if (existingPromotionVideoData) {
                            const createdHistoryData = await promotionvideohistory.create(existingPromotionVideoData.dataValues);
                            if (!createdHistoryData) {
                                return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create history entry" });
                            }
                        };
                        //! History Table end
                        const addedModule = await promotionvideo.update({
                            Title: parsedModule.Title ?? undefined,
                            VideoColletionTitle: parsedModule.VideoColletionTitle ?? undefined,
                            Description: parsedModule.Description ?? undefined,
                            CTA: parsedModule.CTA ?? undefined,
                            Position: parsedModule.Position ?? undefined,
                            CreatedBy: AccDetails.FirstName,
                            LastModifiedBy: AccDetails.FirstName,
                        }, { where: { PromotionID: id, PromotionVideoID: parsedModule.PromotionVideoID } });

                        // Handle ImgFile updates
                        if (PvT && PvT.length > 0) {
                            let ctCheck = [];
                            await Promise.all(PvT.map(async (singleMt) => {
                                const splitMt = singleMt.split("_");
                                const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                ctCheck.push(indexMt);

                                if (indexMt == parsedModule.Position) {
                                    await promotionvideo.update({ ImgFile: singleMt }, { where: { PromotionID: id, PromotionVideoID: parsedModule.PromotionVideoID } });
                                }
                            }));
                            if (!ctCheck.includes(parsedModule.Position.toString())) {
                                await promotionvideo.update({ ImgFile: null }, { where: { PromotionID: id, PromotionVideoID: parsedModule.PromotionVideoID } });
                            }
                        }

                        // Handle VideoFile updates
                        if (PvV && PvV.length > 0) {
                            let VMtCheck = [];
                            await Promise.all(PvV.map(async (singleVMt) => {
                                const splitVMt = singleVMt.split("_");
                                const indexVMt = splitVMt[splitVMt.length - 1].replace('.mp4', '');
                                VMtCheck.push(indexVMt);

                                if (indexVMt == parsedModule.Position) {
                                    const duration  = await asyncFfmpegHandler(`${videoDir}/${singleVMt}`);
                                    await promotionvideo.update({ VideoFile: singleVMt, VideoFileLength: duration }, { where: { PromotionID: id, PromotionVideoID: parsedModule.PromotionVideoID } });
                                }
                            }));
                            if (!VMtCheck.includes(parsedModule.Position.toString())) {
                                await promotionvideo.update({ VideoFile: null }, { where: { PromotionID: id, PromotionVideoID: parsedModule.PromotionVideoID } });
                            }
                        }

                        // Handle SubtitleFile updates
                        if (PvS && PvS.length > 0) {
                            let SmtCheck = [];
                            await Promise.all(PvS.map(async (singleSMt) => {
                                const splitSMt = singleSMt.split("_");
                                const indexSMt = splitSMt[splitSMt.length - 1].replace('.txt', '');
                                SmtCheck.push(indexSMt);

                                if (indexSMt == parsedModule.Position) {
                                    await promotionvideo.update({ SubtitleFile: singleSMt }, { where: { PromotionID: id, PromotionVideoID: parsedModule.PromotionVideoID } });
                                }
                            }));
                            if (!SmtCheck.includes(parsedModule.Position.toString())) {
                                await promotionvideo.update({ SubtitleFile: null }, { where: { PromotionID: id, PromotionVideoID: parsedModule.PromotionVideoID } });
                            }
                        }

                    } else {

                        // Create a new promotion video entry
                        const newPromotionVideo = await promotionvideo.create({
                            PromotionID: id,
                            Title: parsedModule.Title ?? undefined,
                            VideoColletionTitle: parsedModule.VideoColletionTitle ?? undefined,
                            Description: parsedModule.Description ?? undefined,
                            CTA: parsedModule.CTA ?? undefined,
                            Position: parsedModule.Position ?? undefined,
                            CreatedBy: AccDetails.FirstName,
                            LastModifiedBy: AccDetails.FirstName,
                        });

                        if (!newPromotionVideo) {
                            return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create promotion video entry" });
                        }

                        // Handle file updates (ImgFile, VideoFile, SubtitleFile) similarly as in your update logic

                        // Example of handling ImgFile update for the new entry (adjust for VideoFile and SubtitleFile similarly)
                        if (PvT && PvT.length > 0) {
                            let ctCheck = [];
                            await Promise.all(PvT.map(async (singleMt) => {
                                const splitMt = singleMt.split("_");
                                const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                ctCheck.push(indexMt);

                                if (indexMt == parsedModule.Position) {


                                    await promotionvideo.update({ ImgFile: singleMt }, { where: { PromotionID: id, PromotionVideoID: newPromotionVideo.PromotionVideoID } });
                                }
                            }));

                            if (!ctCheck.includes(parsedModule.Position.toString())) {
                                await promotionvideo.update({ ImgFile: null }, { where: { PromotionID: id, PromotionVideoID: newPromotionVideo.PromotionVideoID } });
                            }
                        }

                        // Example of handling VideoFile update for the new entry
                        if (PvV && PvV.length > 0) {
                            let VMtCheck = [];
                            await Promise.all(PvV.map(async (singleVMt) => {
                                const splitVMt = singleVMt.split("_");
                                const indexVMt = splitVMt[splitVMt.length - 1].replace('.mp4', '');
                                VMtCheck.push(indexVMt);

                                if (indexVMt == parsedModule.Position) {


                                    await promotionvideo.update({ VideoFile: singleVMt }, { where: { PromotionID: id, PromotionVideoID: newPromotionVideo.PromotionVideoID } });
                                }
                            }));

                            if (!VMtCheck.includes(parsedModule.Position.toString())) {
                                await promotionvideo.update({ VideoFile: null }, { where: { PromotionID: id, PromotionVideoID: newPromotionVideo.PromotionVideoID } });
                            }
                        }

                        // Example of handling SubtitleFile update for the new entry
                        if (PvS && PvS.length > 0) {
                            let SmtCheck = [];
                            await Promise.all(PvS.map(async (singleSMt) => {
                                const splitSMt = singleSMt.split("_");
                                const indexSMt = splitSMt[splitSMt.length - 1].replace('.txt', '');
                                SmtCheck.push(indexSMt);

                                if (indexSMt == parsedModule.Position) {


                                    await promotionvideo.update({ SubtitleFile: singleSMt }, { where: { PromotionID: id, PromotionVideoID: newPromotionVideo.PromotionVideoID } });
                                }
                            }));

                            if (!SmtCheck.includes(parsedModule.Position.toString())) {
                                await promotionvideo.update({ SubtitleFile: null }, { where: { PromotionID: id, PromotionVideoID: newPromotionVideo.PromotionVideoID } });
                            }
                        }

                    }
                }));


            }
        }


        if (result.PromotionOnboardingVideo) {
            const PromotionOnboardingVideo = JSON.parse(result.PromotionOnboardingVideo);

            if (PromotionOnboardingVideo.length > 0) {
                await Promise.all(PromotionOnboardingVideo.map(async (singleModule, index) => {
                    const parsedModule = singleModule;

                    if (parsedModule.PromotionOnboardingVideoID) {
                        //! Maintain History Table 
                        let existingPromotionOnboeardingVideoData = await promotiononboardingvideo.findOne({ where: { PromotionOnboardingVideoID: parsedModule.PromotionOnboardingVideoID } });

                        if (existingPromotionOnboeardingVideoData) {
                            const createdHistoryData = await promotiononboardingvideohistory.create(existingPromotionOnboeardingVideoData.dataValues);
                            if (!createdHistoryData) {
                                return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create history entry" });
                            }
                        };
                        //! History Table end

                        const addedModule = await promotiononboardingvideo.update({
                            Title: parsedModule.Title ?? undefined,
                            DeviceType: parsedModule.DeviceType ?? undefined,
                            Description: parsedModule.Description ?? undefined,
                            CTA: parsedModule.CTA ?? undefined,
                            ImgFile: parsedModule.ImgFile ?? undefined,
                            VideoFile: parsedModule.VideoFile ?? undefined,
                            SubtitleFile: parsedModule.SubtitleFile ?? undefined,
                            Position: parsedModule.Position ?? undefined,
                            CreatedBy: AccDetails.FirstName,
                            LastModifiedBy: AccDetails.FirstName,
                        }, { where: { PromotionID: id, PromotionOnboardingVideoID: parsedModule.PromotionOnboardingVideoID } });

                        // Handle ImgFile updates (replace with your specific field names)
                        if (OvT && OvT.length > 0) {
                            let ctCheck = [];
                            await Promise.all(OvT.map(async (singleMt) => {
                                const splitMt = singleMt.split("_");
                                const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                ctCheck.push(indexMt);

                                if (indexMt == parsedModule.Position) {
                                    await promotiononboardingvideo.update({ ImgFile: singleMt }, { where: { PromotionID: id, PromotionOnboardingVideoID: parsedModule.PromotionOnboardingVideoID } });
                                }
                            }));
                            if (!ctCheck.includes(parsedModule.Position.toString())) {
                                await promotiononboardingvideo.update({ ImgFile: null }, { where: { PromotionID: id, PromotionOnboardingVideoID: parsedModule.PromotionOnboardingVideoID } });
                            }
                        }

                        // Handle VideoFile updates (replace with your specific field names)
                        if (OvV && OvV.length > 0) {
                            let VMtCheck = [];
                            await Promise.all(OvV.map(async (singleVMt) => {
                                const splitVMt = singleVMt.split("_");
                                const indexVMt = splitVMt[splitVMt.length - 1].replace('.mp4', '');
                                VMtCheck.push(indexVMt);

                                if (indexVMt == parsedModule.Position) {
                                    const duration  = await asyncFfmpegHandler(`${videoDir}/${singleVMt}`);
                                    await promotiononboardingvideo.update({ VideoFile: singleVMt, VideoFileLength: duration }, { where: { PromotionID: id, PromotionOnboardingVideoID: parsedModule.PromotionOnboardingVideoID } });
                                }
                            }));
                            if (!VMtCheck.includes(parsedModule.Position.toString())) {
                                await promotiononboardingvideo.update({ VideoFile: null }, { where: { PromotionID: id, PromotionOnboardingVideoID: parsedModule.PromotionOnboardingVideoID } });
                            }
                        }

                        // Handle SubtitleFile updates (replace with your specific field names)
                        if (OvS && OvS.length > 0) {
                            let SmtCheck = [];
                            await Promise.all(OvS.map(async (singleSMt) => {
                                const splitSMt = singleSMt.split("_");
                                const indexSMt = splitSMt[splitSMt.length - 1].replace('.txt', '');
                                SmtCheck.push(indexSMt);

                                if (indexSMt == parsedModule.Position) {
                                    await promotiononboardingvideo.update({ SubtitleFile: singleSMt }, { where: { PromotionID: id, PromotionOnboardingVideoID: parsedModule.PromotionOnboardingVideoID } });
                                }
                            }));
                            if (!SmtCheck.includes(parsedModule.Position.toString())) {
                                await promotiononboardingvideo.update({ SubtitleFile: null }, { where: { PromotionID: id, PromotionOnboardingVideoID: parsedModule.PromotionOnboardingVideoID } });
                            }
                        }

                    } else {

                        // Create a new promotion onboarding video entry
                        const newPromotionOnboardingVideo = await promotiononboardingvideo.create({
                            PromotionID: id,
                            Title: parsedModule.Title ?? undefined,
                            DeviceType: parsedModule.DeviceType ?? undefined,
                            Description: parsedModule.Description ?? undefined,
                            CTA: parsedModule.CTA ?? undefined,
                            ImgFile: parsedModule.ImgFile ?? undefined,
                            VideoFile: parsedModule.VideoFile ?? undefined,
                            SubtitleFile: parsedModule.SubtitleFile ?? undefined,
                            Position: parsedModule.Position ?? undefined,
                            CreatedBy: AccDetails.FirstName,
                            LastModifiedBy: AccDetails.FirstName,
                        });

                        if (!newPromotionOnboardingVideo) {
                            return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create promotion onboarding video entry" });
                        }

                        // Handle file updates (ImgFile, VideoFile, SubtitleFile) similarly as in your update logic

                        // Example of handling ImgFile update for the new entry (adjust for VideoFile and SubtitleFile similarly)
                        if (OvT && OvT.length > 0) {
                            let ctCheck = [];
                            await Promise.all(OvT.map(async (singleMt) => {
                                const splitMt = singleMt.split("_");
                                const indexMt = await splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                                ctCheck.push(indexMt);

                                if (indexMt == parsedModule.Position) {
                                    await promotiononboardingvideo.update({ ImgFile: singleMt }, { where: { PromotionID: id, PromotionOnboardingVideoID: newPromotionOnboardingVideo.PromotionOnboardingVideoID } });
                                }
                            }));

                            if (!ctCheck.includes(parsedModule.Position.toString())) {
                                await promotiononboardingvideo.update({ ImgFile: null }, { where: { PromotionID: id, PromotionOnboardingVideoID: newPromotionOnboardingVideo.PromotionOnboardingVideoID } });
                            }
                        }

                        // Example of handling VideoFile update for the new entry
                        if (OvV && OvV.length > 0) {
                            let VMtCheck = [];
                            await Promise.all(OvV.map(async (singleVMt) => {
                                const splitVMt = singleVMt.split("_");
                                const indexVMt = splitVMt[splitVMt.length - 1].replace('.mp4', '');
                                VMtCheck.push(indexVMt);

                                if (indexVMt == parsedModule.Position) {

                                    await promotiononboardingvideo.update({ VideoFile: singleVMt }, { where: { PromotionID: id, PromotionOnboardingVideoID: newPromotionOnboardingVideo.PromotionOnboardingVideoID } });
                                }
                            }));

                            if (!VMtCheck.includes(parsedModule.Position.toString())) {
                                await promotiononboardingvideo.update({ VideoFile: null }, { where: { PromotionID: id, PromotionOnboardingVideoID: newPromotionOnboardingVideo.PromotionOnboardingVideoID } });
                            }
                        }

                        // Example of handling SubtitleFile update for the new entry
                        if (OvS && OvS.length > 0) {
                            let SmtCheck = [];
                            await Promise.all(OvS.map(async (singleSMt) => {
                                const splitSMt = singleSMt.split("_");
                                const indexSMt = splitSMt[splitSMt.length - 1].replace('.txt', '');
                                SmtCheck.push(indexSMt);

                                if (indexSMt == parsedModule.Position) {


                                    await promotiononboardingvideo.update({ SubtitleFile: singleSMt }, { where: { PromotionID: id, PromotionOnboardingVideoID: newPromotionOnboardingVideo.PromotionOnboardingVideoID } });
                                }
                            }));

                            if (!SmtCheck.includes(parsedModule.Position.toString())) {
                                await promotiononboardingvideo.update({ SubtitleFile: null }, { where: { PromotionID: id, PromotionOnboardingVideoID: newPromotionOnboardingVideo.PromotionOnboardingVideoID } });
                            }
                        }

                    }
                }));

            }
        }










        return res.status(200).json({
            Message: "Promotion information updated successfully!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            Message: "Server Error",
        });
    }






}






const DeleteRequest = async (req, res) => {
    try {
        const { AccDetails } = req;
        // if (AccDetails.AccountType !== "Admin") {
        //     return res.status(404).json({ message: "Login With Admin Email And Password." });
        // }
        const id = req.params.id;
        const GetPromotionData = await promotion.findOne({
            where: { PromotionID: id },
        });
        if (!GetPromotionData) {
            return res
                .status(400)
                .json({
                    ErrorCode: "REQUEST",
                    message: "Promotion Data not found",
                });
        }
        const CreatePromotionHistoryData = await promotionhistory.create(
            GetPromotionData.dataValues
        );
        if (!CreatePromotionHistoryData) {
            return res
                .status(400)
                .json({
                    ErrorCode: "REQUEST",
                    message: "Promotion Data Not insert in History Table",
                });
        }
        const DeletePromotionData = await promotion.destroy({
            where: { PromotionID: id },
        });
        if (!DeletePromotionData) {
            return res
                .status(400)
                .json({
                    ErrorCode: "REQUEST",
                    message: "Promotion Data Not deleted",
                });
        }
        res.status(201).json({ message: "Data Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const DeleteModuleRequest = async (req, res) => {
    try {
        const { AccDetails } = req;

        // if (AccDetails.AccountType !== "Admin") {
        //     return res.status(404).json({ message: "Login With Admin Email And Password." });
        // }
        const { PromotionID, ModuleID } = req.params;
        const result = req.body;

        if (result.modulename == "promotioncarousel") {
            const GetPromotionCarouselData = await promotioncarousel.findOne({
                where: { PromotionID: PromotionID, PromotionCarouselID: ModuleID },
            });
            if (!GetPromotionCarouselData) {
                return res
                    .status(400)
                    .json({ ErrorCode: "REQUEST", message: "PromotionCarousel Data not found" });
            }
            const CreatePromotionCarouselHistoryData = await promotioncarouselhistory.create(
                GetPromotionCarouselData.dataValues
            );
            if (!CreatePromotionCarouselHistoryData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "PromotionCarousel Data Not insert in History Table",
                    });
            }
            if (GetPromotionCarouselData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Thumbnail/" + GetPromotionCarouselData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionCarouselData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Video/" + GetPromotionCarouselData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionCarouselData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Subtitle/" + GetPromotionCarouselData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }
            const DeletePromotionCarouselData = await promotioncarousel.destroy({
                where: { PromotionID: PromotionID, PromotionCarouselID: ModuleID },
            });
            if (!DeletePromotionCarouselData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "PromotionCarousel Data Not deleted",
                    });
            }
        }
        if (result.modulename == "promotionvideo") {
            const GetPromotionvideoData = await promotionvideo.findOne({
                where: { PromotionID: PromotionID, PromotionVideoID: ModuleID },
            });
            if (!GetPromotionvideoData) {
                return res
                    .status(400)
                    .json({ ErrorCode: "REQUEST", message: "Promotionvideo Data not found" });
            }
            const CreatePromotionvideoHistoryData = await promotionvideohistory.create(
                GetPromotionvideoData.dataValues
            );
            if (!CreatePromotionvideoHistoryData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "Promotion Data Not insert in History Table",
                    });
            }
            if (GetPromotionvideoData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Thumbnail/" + GetPromotionvideoData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionvideoData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Video/" + GetPromotionvideoData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionvideoData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Subtitle/" + GetPromotionvideoData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }

            const DeletePromotionvideoData = await promotionvideo.destroy({
                where: { PromotionID: PromotionID, PromotionVideoID: ModuleID },
            });
            if (!DeletePromotionvideoData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "Promotionvideo Data Not deleted",
                    });
            }
        }
        if (result.modulename == "promotiononboardingvideo") {
            const GetPromotionOnBoardingVideoData = await promotiononboardingvideo.findOne({
                where: { PromotionID: PromotionID, PromotionOnboardingVideoID: ModuleID },
            });
            if (!GetPromotionOnBoardingVideoData) {
                return res
                    .status(400)
                    .json({ ErrorCode: "REQUEST", message: "PromotionOnBoardingVideo Data not found" });
            }
            const CreatePromotionOnBoardingVideoHistoryData = await promotiononboardingvideohistory.create(
                GetPromotionOnBoardingVideoData.dataValues
            );
            if (!CreatePromotionOnBoardingVideoHistoryData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "Promotion Data Not insert in History Table",
                    });
            }

            if (GetPromotionOnBoardingVideoData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Thumbnail/" + GetPromotionOnBoardingVideoData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionOnBoardingVideoData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Video/" + GetPromotionOnBoardingVideoData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionOnBoardingVideoData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Subtitle/" + GetPromotionOnBoardingVideoData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }
            const DeletePromotionOnBoardingVideoData = await promotiononboardingvideo.destroy({
                where: { PromotionID: PromotionID, PromotionOnboardingVideoID: ModuleID },
            });
            if (!DeletePromotionOnBoardingVideoData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "PromotionOnBoardingVideo Data Not deleted",
                    });
            }
        }

        res.status(201).json({ message: "Data Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};






async function uploadPromotionFiles(req, res, next) {
    try {
        if (req.files) {

            let CthumbnailArray = [];
            let VthumbnailArray = [];
            let OthumbnailArray = [];
            let CvideoArray = [];
            let VvideoArray = [];
            let OvideoArray = [];
            let CsubtitleArray = [];
            let VsubtitleArray = [];
            let OsubtitleArray = [];
            // Handle Thumbnail files
            if (req.files.Thumbnail) {
                const imageFiles = Array.isArray(req.files.Thumbnail) ? req.files.Thumbnail : [req.files.Thumbnail];

                await Promise.all(imageFiles.map(async (singleThumbFile) => {
                    let imageReqArray = singleThumbFile.name.split("_");
                    const imgName = imageReqArray[0];
                    const uploadDir = path.join(__dirname, '..', '/volume/Thumbnail/');

                    if (imgName === "CarouselThumbnail") {
                        CthumbnailArray.push(singleThumbFile.name);
                        req.Ct = CthumbnailArray;
                        await singleThumbFile.mv(uploadDir + singleThumbFile.name);
                    }
                    if (imgName === "PromotionVideoThumbnail") {
                        VthumbnailArray.push(singleThumbFile.name);
                        req.PvT = VthumbnailArray;
                        await singleThumbFile.mv(uploadDir + singleThumbFile.name);
                    }
                    if (imgName === "OnboardingVideoThumbnail") {
                        OthumbnailArray.push(singleThumbFile.name);
                        req.OvT = OthumbnailArray;
                        await singleThumbFile.mv(uploadDir + singleThumbFile.name);
                    }
                }));
            }

            // Handle Video files
            if (req.files.Video) {
                const videoFiles = Array.isArray(req.files.Video) ? req.files.Video : [req.files.Video];

                await Promise.all(videoFiles.map(async (singleVideoFile) => {
                    let videoReqArray = singleVideoFile.name.split("_");
                    const videoName = videoReqArray[0];
                    const uploadDir = path.join(__dirname, '..', '/volume/Video/');

                    if (videoName === "CarouselVideo") {
                        CvideoArray.push(singleVideoFile.name);
                        req.Cv = CvideoArray;
                        await singleVideoFile.mv(uploadDir + singleVideoFile.name);
                    }
                    if (videoName === "PromotionVideoVideo") {
                        VvideoArray.push(singleVideoFile.name);
                        req.PvV = VvideoArray;
                        await singleVideoFile.mv(uploadDir + singleVideoFile.name);
                    }
                    if (videoName === "OnboardingVideoVideo") {
                        OvideoArray.push(singleVideoFile.name);
                        req.OvV = OvideoArray;
                        await singleVideoFile.mv(uploadDir + singleVideoFile.name);
                    }
                }));
            }

            // Handle Subtitle files
            if (req.files.Subtitle) {
                const subtitleFiles = Array.isArray(req.files.Subtitle) ? req.files.Subtitle : [req.files.Subtitle];

                await Promise.all(subtitleFiles.map(async (singleSub) => {
                    let subReqArray = singleSub.name.split("_");
                    const subName = subReqArray[0];
                    const uploadDir = path.join(__dirname, '..', '/volume/Subtitle/');

                    if (subName === "CarouselSubtitle") {
                        CsubtitleArray.push(singleSub.name);
                        req.Cs = CsubtitleArray;
                        await singleSub.mv(uploadDir + singleSub.name);
                    }
                    if (subName === "PromotionVideoSubtitle") {
                        VsubtitleArray.push(singleSub.name);
                        req.PvS = VsubtitleArray;
                        await singleSub.mv(uploadDir + singleSub.name);
                    }
                    if (subName === "OnboardingVideoSubtitle") {
                        OsubtitleArray.push(singleSub.name);
                        req.OvS = OsubtitleArray;
                        await singleSub.mv(uploadDir + singleSub.name);
                    }
                }));
            }
            next();
        } else {
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an error while uploading files"
        });
    }
}




// HTTTP REQUEST
const GetHttpPromotionRequest = async (req, res) => {
    try {

        const id = req.params.id;
        const GetPromotionData = await promotion.findOne({
            where: { PromotionID: id },

            include: [{
                model: promotioncarousel,
                as: 'promotioncarousel'
            }, {
                model: promotionvideo,
                as: 'promotionvideo'
            }, {
                model: promotiononboardingvideo,
                as: 'promotiononboardingvideo',
            }]
        });
        if (GetPromotionData) {
            return res.status(200).json({
                TotalCount: GetPromotionData.length,
                Data: GetPromotionData,
            });
        } else {
            return res.status(400).json({ Data: "Promotion Data Not Gets!" });
        }
    } catch (error) {
        return res
            .status(400)
            .json({
                ErrorCode: "REQUEST",
                message: error.message,
                Error: error,
            });
    }
}

const GetHttpPromotionsRequest = async (req, res) => {
    try {

        let { AccountType } = req.query;

        const whereCondition = AccountType ? { AccountType: AccountType } : {};

        const promotions = await promotion.findAll({
            where: whereCondition,
            //order: [['PromotionID', 'DESC']],
            include: [{
                model: promotioncarousel,
                as: 'promotioncarousel'
            }, {
                model: promotionvideo,
                as: 'promotionvideo'
            }, {
                model: promotiononboardingvideo,
                as: 'promotiononboardingvideo',
            }]
        });

        if (promotions && promotions.length > 0) {
            return res.status(200).json({
                Data: promotions,
            });
        } else {
            return res.status(400).json({ Data: "Promotion Data Not Found!" });
        }
    } catch (error) {
        return res.status(400).json({
            ErrorCode: "REQUEST",
            message: error.message,
            Error: error,
        });
    }
}

const DeleteModule = async (req, res) => {

    //return  res.status(200).json(req.query);
    try {


        const { PromotionID, ModuleID } = req.query;
        const result = req.body;

        if (req.query.Status == 1) {
            const GetPromotionCarouselData = await promotioncarousel.findOne({
                where: { PromotionID: PromotionID, PromotionCarouselID: ModuleID },
            });


            if (!GetPromotionCarouselData) {
                return res
                    .status(400)
                    .json({ ErrorCode: "REQUEST", message: "PromotionCarousel Data not found" });
            }
            const CreatePromotionCarouselHistoryData = await promotioncarouselhistory.create(
                GetPromotionCarouselData.dataValues
            );

            if (!CreatePromotionCarouselHistoryData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "PromotionCarousel Data Not insert in History Table",
                    });
            }

            if (GetPromotionCarouselData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Thumbnail/" + GetPromotionCarouselData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionCarouselData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Video/" + GetPromotionCarouselData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionCarouselData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Subtitle/" + GetPromotionCarouselData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }
            const DeletePromotionCarouselData = await promotioncarousel.destroy({
                where: { PromotionID: PromotionID, PromotionCarouselID: ModuleID },
            });
            if (!DeletePromotionCarouselData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "PromotionCarousel Data Not deleted",
                    });
            }
        }

        if (req.query.Status == 2) {
            const GetPromotionvideoData = await promotionvideo.findOne({
                where: { PromotionID: PromotionID, PromotionVideoID: ModuleID },
            });
            if (!GetPromotionvideoData) {
                return res
                    .status(400)
                    .json({ ErrorCode: "REQUEST", message: "Promotionvideo Data not found" });
            }
            const CreatePromotionvideoHistoryData = await promotionvideohistory.create(
                GetPromotionvideoData.dataValues
            );
            if (!CreatePromotionvideoHistoryData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "Promotion Data Not insert in History Table",
                    });
            }
            if (GetPromotionvideoData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Thumbnail/" + GetPromotionvideoData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionvideoData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Video/" + GetPromotionvideoData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionvideoData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Subtitle/" + GetPromotionvideoData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }

            const DeletePromotionvideoData = await promotionvideo.destroy({
                where: { PromotionID: PromotionID, PromotionVideoID: ModuleID },
            });
            if (!DeletePromotionvideoData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "Promotionvideo Data Not deleted",
                    });
            }
        }

        if (req.query.Status == 3) {
            const GetPromotionOnBoardingVideoData = await promotiononboardingvideo.findOne({
                where: { PromotionID: PromotionID, PromotionOnboardingVideoID: ModuleID },
            });
            if (!GetPromotionOnBoardingVideoData) {
                return res
                    .status(400)
                    .json({ ErrorCode: "REQUEST", message: "PromotionOnBoardingVideo Data not found" });
            }
            const CreatePromotionOnBoardingVideoHistoryData = await promotiononboardingvideohistory.create(
                GetPromotionOnBoardingVideoData.dataValues
            );
            if (!CreatePromotionOnBoardingVideoHistoryData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "Promotion Data Not insert in History Table",
                    });
            }

            if (GetPromotionOnBoardingVideoData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Thumbnail/" + GetPromotionOnBoardingVideoData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionOnBoardingVideoData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Video/" + GetPromotionOnBoardingVideoData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionOnBoardingVideoData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/volume/Subtitle/" + GetPromotionOnBoardingVideoData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }
            const DeletePromotionOnBoardingVideoData = await promotiononboardingvideo.destroy({
                where: { PromotionID: PromotionID, PromotionOnboardingVideoID: ModuleID },
            });
            if (!DeletePromotionOnBoardingVideoData) {
                return res
                    .status(400)
                    .json({
                        ErrorCode: "REQUEST",
                        message: "PromotionOnBoardingVideo Data Not deleted",
                    });
            }
        }

        res.status(201).json({ message: "Data Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    // AddRequest,
    GetPromotionsRequest,
    GetPromotionRequest,
    UpdateRequest,
    DeleteRequest,
    DeleteModuleRequest,
    uploadPromotionFiles,
    GetHttpPromotionRequest,
    GetHttpPromotionsRequest,
    DeleteModule
};

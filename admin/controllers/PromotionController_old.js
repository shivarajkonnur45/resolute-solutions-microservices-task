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
const PromotionCarouselModel = require("../models/PromotionCarouselModel");

// Add default data for update
async function showPromotionData() {
    try {
        const accountTypes = ['Student', 'Parent', 'Company'];
        for (const type of accountTypes) {
            let promotionData = await promotion.findOne({ where: { AccountType: type } });
            if (!promotionData) {
                await promotion.create({
                    AccountType: type,
                    IsActive: 1,
                });
            }
        }
    } catch (error) {
        console.error('Error fetching promotion data:', error);
    }
}
showPromotionData();

const AddRequest = async (req, res) => {
    try {
        const { AccDetails } = req;


        const result = req.body;
        const { Mt, Tt, VCt, VMt, SMt } = req;

        const createdPromotionData = await promotion.create({
            PromotionTitle: result.PromotionTitle ?? undefined,
            CTA: result.CTA ?? undefined,
            AccountType: result.AccountType ?? undefined,
            MembershipBannerTitle: result.MembershipBannerTitle ?? undefined,
            MembershipBannerCTA: result.MembershipBannerCTA ?? undefined,
            MembershipBannerTag: result.MembershipBannerTag ?? undefined,
            MembershipReferralTitle: result.MembershipReferralTitle ?? undefined,
            MembershipReferralCTA: result.MembershipReferralCTA ?? undefined,
            MembershipReferralTag: result.MembershipReferralTag ?? undefined,
            MembershipReferralDescription: result.MembershipReferralDescription ?? undefined,
            IsActive: result.IsActive,
            CreatedBy: AccDetails.FirstName,
            LastModifiedBy: AccDetails.FirstName,
        });
        console.log("Promotion" + createdPromotionData);

        if (createdPromotionData && result.PromotionCarousel) {
            console.log(true);
            const parsedPromotionCarousel = JSON.parse(result.PromotionCarousel);
            const moduleIDs = [];

            await Promise.all(parsedPromotionCarousel.map(async (singleModule) => {
                const CreatePromotionCarouselData = await promotioncarousel.create({
                    PromotionID: createdPromotionData.PromotionID,
                    Title: singleModule.Title ?? undefined,
                    Description: singleModule.Description ?? undefined,
                    CTA: singleModule.CTA ?? undefined,
                    CreatedBy: AccDetails.FirstName,
                });

                moduleIDs.push(CreatePromotionCarouselData.PromotionCarouselID);

                if (Mt && Mt.length > 0) {
                    Mt.forEach(async (singleMt) => {
                        const splitMt = singleMt.split("_");
                        const indexMt = splitMt[splitMt.length - 1].replace('.jpg', '').replace('.png', '');
                        if (indexMt == singleModule.position) {
                            await promotioncarousel.update({ ImgFile: singleMt }, { where: { PromotionCarouselID: CreatePromotionCarouselData.PromotionCarouselID } });
                        }
                    });
                }

                if (VMt && VMt.length > 0) {
                    VMt.forEach(async (singleVMt) => {
                        const splitVMt = singleVMt.split("_");
                        const indexVMt = splitVMt[splitVMt.length - 1].replace('.mp4', '');
                        if (indexVMt == singleModule.position) {
                            await promotioncarousel.update({ VideoFile: singleVMt }, { where: { PromotionCarouselID: CreatePromotionCarouselData.PromotionCarouselID } });
                        }
                    });
                }

                if (SMt && SMt.length > 0) {
                    SMt.forEach(async (singleSMt) => {
                        const splitSMt = singleSMt.split("_");
                        const indexSMt = splitSMt[splitSMt.length - 1].replace('.txt', '');
                        if (indexSMt == singleModule.position) {
                            await promotioncarousel.update({ SubtitleFile: singleSMt }, { where: { PromotionCarouselID: CreatePromotionCarouselData.PromotionCarouselID } });
                        }
                    });
                }
            }));

            return res.status(200).json({
                Message: "Promotion information added successfully!",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            ErrorCode: "REQUEST",
            message: error.message,
            Error: error,
        });
    }
};



const GetPromotionsRequest = async (req, res) => {
    try {
        // if (req.token.AccountType !== "Admin") {
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
        return res.status(400).send({
            ErrorCode: "REQUEST",
            message: error.message,
            Error: error,
        });
    }
}
const GetPromotionRequest = async (req, res) => {
    try {
        const { AccDetails } = req;

        // if (AccDetails.AccountType !== "Admin") {
        //     return res.status(404).json({ message: "Login With Admin Email And Password." });
        // }
        const id = req.params.id;
        console.log(id);
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
            .send({
                ErrorCode: "REQUEST",
                message: error.message,
                Error: error,
            });
    }
};
// const UpdateRequest = async (req, res) => {
//     try {
//         const { AccDetails } = req;

//         if (AccDetails.AccountType !== "Admin") {
//             return res.status(404).json({ message: "Login With Admin Email And Password." });
//         }
//         const id = req.params.id;
//         const result = req.body;
//         const GetPromotionData = await promotion.findOne({
//             where: { PromotionID: id },
//         });
//         if (!GetPromotionData) {
//             return res
//                 .status(400)
//                 .send({
//                     ErrorCode: "REQUEST",
//                     message: "Promotion Data not found",
//                 });
//         }
//         const CreatePromotionHistoryData = await promotionhistory.create(
//             GetPromotionData.dataValues
//         );
//         if (!CreatePromotionHistoryData) {
//             return res
//                 .status(400)
//                 .send({
//                     ErrorCode: "REQUEST",
//                     message: "Promotion Data Not insert in History Table",
//                 });
//         }
//         const UpdatePromotionData = await promotion.update(
//             {
//                 CTA: result.CTA ?? undefined,
//                 PromotionTitle: result.PromotionTitle ?? undefined,
//                 AccountType: result.AccountType ?? undefined,
//                 MembershipBannerTitle: result.MembershipBannerTitle ?? undefined,
//                 MembershipBannerCTA: result.MembershipBannerCTA ?? undefined,
//                 MembershipBannerTag: result.MembershipBannerTag ?? undefined,
//                 MembershipReferralTitle: result.MembershipReferralTitle ?? undefined,
//                 MembershipReferralCTA: result.MembershipReferralCTA ?? undefined,
//                 MembershipReferralTag: result.MembershipReferralTag ?? undefined,
//                 MembershipReferralDescription: result.MembershipReferralDescription ?? undefined,
//                 IsActive: result.IsActive ?? undefined,
//                 CreatedBy: AccDetails.FirstName,
//                 LastModifiedBy: AccDetails.FirstName,
//             },
//             { where: { PromotionID: id } }
//         );
//         if (UpdatePromotionData) {
//             console.log(result.PromotionCarousel);
//             if (result.PromotionCarousel) {
//                 await Promise.all(
//                     result.PromotionCarousel.map(async (item) => {
//                         if (item.PromotionCarouselID) {
//                             const GetPromotionCarouselData = await promotioncarousel.findOne({
//                                 where: { PromotionID: id, PromotionCarouselID: item.PromotionCarouselID },
//                             });
//                             if (!GetPromotionCarouselData) {
//                                 return res
//                                     .status(400)
//                                     .send({
//                                         ErrorCode: "REQUEST",
//                                         message: "Promotion Carousel Data not found",
//                                     });
//                             }
//                             const CreatePromotionCarouselHistoryData = await promotioncarouselhistory.create(
//                                 GetPromotionCarouselData.dataValues
//                             );
//                             if (!CreatePromotionCarouselHistoryData) {
//                                 return res
//                                     .status(400)
//                                     .send({
//                                         ErrorCode: "REQUEST",
//                                         message: "Promotion Carousel History Data Not insert in History Table",
//                                     });
//                             }
//                             if (GetPromotionCarouselData.Files) {
//                                 if (GetPromotionCarouselData.ImgFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.ImgFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                                 if (GetPromotionCarouselData.VideoFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.VideoFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                                 if (GetPromotionCarouselData.SubtitleFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.SubtitleFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                             }
//                             return promotioncarousel.update({
//                                 Title: item.Title ?? undefined,
//                                 Description: item.Description ?? undefined,
//                                 CTA: item.CTA ?? undefined,
//                                 ImgFile: item.ImgFile ?? GetPromotionCarouselData.ImgFile,
//                                 VideoFile: item.VideoFile ?? GetPromotionCarouselData.VideoFile,
//                                 SubtitleFile: item.SubtitleFile ?? GetPromotionCarouselData.SubtitleFile,
//                                 CreatedBy: AccDetails.FirstName,
//                                 LastModifiedBy: AccDetails.FirstName,
//                             }, { where: { PromotionID: id, PromotionCarouselID: item.PromotionCarouselID } });
//                         }
//                         else {
//                             const createpromotioncarousel = promotioncarousel.create({
//                                 PromotionID: id,
//                                 Title: item.Title ?? undefined,
//                                 Description: item.Description ?? undefined,
//                                 CTA: item.CTA ?? undefined,
//                                 ImgFile: item.ImgFile ?? undefined,
//                                 VideoFile: item.VideoFile ?? undefined,
//                                 SubtitleFile: item.SubtitleFile ?? undefined,
//                                 CreatedBy: AccDetails.FirstName,
//                                 LastModifiedBy: AccDetails.FirstName,
//                             });
//                             if (!createpromotioncarousel) {
//                                 error.push("Error inserting promotion carousel Data");
//                             }
//                         }
//                     })

//                 )


//             }
//             if (result.PromotionVideo) {
//                 await Promise.all(
//                     result.PromotionVideo.map(async (item) => {
//                         if (item.PromotionVideoID) {
//                             const GetPromotionVideoData = await promotionvideo.findOne({
//                                 where: { PromotionID: id, PromotionVideoID: item.PromotionVideoID },
//                             });
//                             if (!GetPromotionVideoData) {
//                                 return res
//                                     .status(400)
//                                     .send({
//                                         ErrorCode: "REQUEST",
//                                         message: "PromotionVideo Data not found",
//                                     });
//                             }
//                             const CreatePromotionVideoHistoryData = await promotionvideohistory.create(
//                                 GetPromotionVideoData.dataValues
//                             );
//                             if (!CreatePromotionVideoHistoryData) {
//                                 return res
//                                     .status(400)
//                                     .send({
//                                         ErrorCode: "REQUEST",
//                                         message: "PromotionVideo History Data Not insert in History Table",
//                                     });
//                             }
//                             if (GetPromotionVideoData.Files) {
//                                 if (GetPromotionVideoData.ImgFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionVideoData.ImgFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                                 if (GetPromotionVideoData.VideoFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionVideoData.VideoFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                                 if (GetPromotionVideoData.SubtitleFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionVideoData.SubtitleFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                             }
//                             return promotionvideo.update({
//                                 Title: item.Title ?? undefined,
//                                 Description: item.Description ?? undefined,
//                                 CTA: item.CTA ?? undefined,
//                                 CreatedBy: AccDetails.FirstName,
//                                 LastModifiedBy: AccDetails.FirstName,
//                             }, { where: { PromotionID: id, PromotionVideoID: item.PromotionVideoID } });
//                         }
//                         else {
//                             const createPromotionVideo = promotionvideo.create({
//                                 PromotionID: id,
//                                 Title: item.Title ?? undefined,
//                                 Description: item.Description ?? undefined,
//                                 CTA: item.CTA ?? undefined,
//                                 ImgFile: item.ImgFile ?? undefined,
//                                 VideoFile: item.VideoFile ?? undefined,
//                                 SubtitleFile: item.SubtitleFile ?? undefined,
//                                 CreatedBy: AccDetails.FirstName,
//                                 LastModifiedBy: AccDetails.FirstName,
//                             });
//                             if (!createPromotionVideo) {
//                                 error.push("Error inserting promotion video Data");
//                             }
//                         }
//                     })

//                 )
//             }
//             if (result.PromotionOnboardingVideo) {
//                 await Promise.all(
//                     result.PromotionOnboardingVideo.map(async (item) => {
//                         if (item.PromotionOnboardingVideoID) {
//                             const GetPromotionOnboardingVideoData = await promotiononboardingvideo.findOne({
//                                 where: { PromotionID: id, PromotionOnboardingVideoID: item.PromotionOnboardingVideoID },
//                             });
//                             if (!GetPromotionOnboardingVideoData) {
//                                 return res
//                                     .status(400)
//                                     .send({
//                                         ErrorCode: "REQUEST",
//                                         message: "PromotionOnBordingVideo Data not found",
//                                     });
//                             }
//                             const CreatePromotionOnboardingVideoHistoryData = await promotiononboardingvideohistory.create(
//                                 GetPromotionOnboardingVideoData.dataValues
//                             );
//                             if (!CreatePromotionOnboardingVideoHistoryData) {
//                                 return res
//                                     .status(400)
//                                     .send({
//                                         ErrorCode: "REQUEST",
//                                         message: "PromotionOnBordingVideo History Data Not insert in History Table",
//                                     });
//                             }
//                             if (GetPromotionOnboardingVideoData.Files) {
//                                 if (GetPromotionOnboardingVideoData.ImgFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionOnboardingVideoData.ImgFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                                 if (GetPromotionOnboardingVideoData.VideoFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionOnboardingVideoData.VideoFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                                 if (GetPromotionOnboardingVideoData.SubtitleFile) {
//                                     const parentDir = path.join(__dirname, '..');
//                                     const imagePath = parentDir + "/upload/" + GetPromotionOnboardingVideoData.SubtitleFile;
//                                     await fs.unlinkSync(imagePath);
//                                 }
//                             }
//                             return promotiononboardingvideo.update({
//                                 Title: item.Title ?? undefined,
//                                 Description: item.Description ?? undefined,
//                                 CTA: item.CTA ?? undefined,
//                                 CreatedBy: AccDetails.FirstName,
//                                 LastModifiedBy: AccDetails.FirstName,
//                             }, { where: { PromotionID: id, PromotionOnboardingVideoID: item.PromotionOnboardingVideoID } });
//                         }
//                         else {
//                             const createPromotionOnboardingVideo = promotiononboardingvideo.create({
//                                 PromotionID: id,
//                                 Title: item.Title ?? undefined,
//                                 Description: item.Description ?? undefined,
//                                 CTA: item.CTA ?? undefined,
//                                 ImgFile: item.ImgFile ?? undefined,
//                                 VideoFile: item.VideoFile ?? undefined,
//                                 SubtitleFile: item.SubtitleFile ?? undefined,
//                                 CreatedBy: AccDetails.FirstName,
//                                 LastModifiedBy: AccDetails.FirstName,
//                             });
//                             if (!createPromotionOnboardingVideo) {
//                                 error.push("Error inserting promotion on bordingvideo Data");
//                             }
//                         }
//                     })

//                 )
//             }
//         }

//         return res.status(200).json({
//             Message: "Promotion information Update successfully!",
//         });

//     } catch (error) {
//         // console.log("message" ,error.message, "Error", error);
//         return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
//     }
// };

const UpdateRequest = async (req, res) => {
    // try {
        //     const { AccDetails } = req;

        //     if (AccDetails.AccountType !== "Admin") {
        //         return res.status(404).json({ message: "Login With Admin Email And Password." });
        //     }
        //     const id = req.params.id;
        //     const result = req.body;
        //     const GetPromotionData = await promotion.findOne({
        //         where: { PromotionID: id },
        //     });
        //     if (!GetPromotionData) {
        //         return res
        //             .status(400)
        //             .send({
        //                 ErrorCode: "REQUEST",
        //                 message: "Promotion Data not found",
        //             });
        //     }
        //     const CreatePromotionHistoryData = await promotionhistory.create(
        //         GetPromotionData.dataValues
        //     );
        //     if (!CreatePromotionHistoryData) {
        //         return res
        //             .status(400)
        //             .send({
        //                 ErrorCode: "REQUEST",
        //                 message: "Promotion Data Not insert in History Table",
        //             });
        //     }
        //     const UpdatePromotionData = await promotion.update(
        //         {
        //             CTA: result.CTA ?? undefined,
        //             PromotionTitle: result.PromotionTitle ?? undefined,
        //             AccountType: result.AccountType ?? undefined,
        //             MembershipBannerTitle: result.MembershipBannerTitle ?? undefined,
        //             MembershipBannerCTA: result.MembershipBannerCTA ?? undefined,
        //             MembershipBannerTag: result.MembershipBannerTag ?? undefined,
        //             MembershipReferralTitle: result.MembershipReferralTitle ?? undefined,
        //             MembershipReferralCTA: result.MembershipReferralCTA ?? undefined,
        //             MembershipReferralTag: result.MembershipReferralTag ?? undefined,
        //             MembershipReferralDescription: result.MembershipReferralDescription ?? undefined,
        //             IsActive: result.IsActive ?? undefined,
        //             CreatedBy: AccDetails.FirstName,
        //             LastModifiedBy: AccDetails.FirstName,
        //         },
        //         { where: { PromotionID: id } }
        //     );
        //     if (UpdatePromotionData) {
        //         if (result.PromotionCarousel) {
        //             await Promise.all(
        //                 result.PromotionCarousel.map(async (item) => {
        //                     if (item.PromotionCarouselID) {
        //                         const GetPromotionCarouselData = await promotioncarousel.findOne({
        //                             where: { PromotionID: id, PromotionCarouselID: item.PromotionCarouselID },
        //                         });
        //                         if (!GetPromotionCarouselData) {
        //                             return res
        //                                 .status(400)
        //                                 .send({
        //                                     ErrorCode: "REQUEST",
        //                                     message: "Promotion Carousel Data not found",
        //                                 });
        //                         }
        //                         const CreatePromotionCarouselHistoryData = await promotioncarouselhistory.create(
        //                             GetPromotionCarouselData.dataValues
        //                         );
        //                         if (!CreatePromotionCarouselHistoryData) {
        //                             return res
        //                                 .status(400)
        //                                 .send({
        //                                     ErrorCode: "REQUEST",
        //                                     message: "Promotion Carousel History Data Not insert in History Table",
        //                                 });
        //                         }
        //                         if (GetPromotionCarouselData.Files) {
        //                             if (GetPromotionCarouselData.ImgFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.ImgFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                             if (GetPromotionCarouselData.VideoFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.VideoFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                             if (GetPromotionCarouselData.SubtitleFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.SubtitleFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                         }
        //                         return promotioncarousel.update({
        //                             Title: item.Title ?? undefined,
        //                             Description: item.Description ?? undefined,
        //                             CTA: item.CTA ?? undefined,
        //                             ImgFile: item.ImgFile ?? GetPromotionCarouselData.ImgFile,
        //                             VideoFile: item.VideoFile ?? GetPromotionCarouselData.VideoFile,
        //                             SubtitleFile: item.SubtitleFile ?? GetPromotionCarouselData.SubtitleFile,
        //                             CreatedBy: AccDetails.FirstName,
        //                             LastModifiedBy: AccDetails.FirstName,
        //                         }, { where: { PromotionID: id, PromotionCarouselID: item.PromotionCarouselID } });
        //                     }
        //                     else {
        //                         const createpromotioncarousel = promotioncarousel.create({
        //                             PromotionID: id,
        //                             Title: item.Title ?? undefined,
        //                             Description: item.Description ?? undefined,
        //                             CTA: item.CTA ?? undefined,
        //                             ImgFile: item.ImgFile ?? undefined,
        //                             VideoFile: item.VideoFile ?? undefined,
        //                             SubtitleFile: item.SubtitleFile ?? undefined,
        //                             CreatedBy: AccDetails.FirstName,
        //                             LastModifiedBy: AccDetails.FirstName,
        //                         });
        //                         if (!createpromotioncarousel) {
        //                             error.push("Error inserting promotion carousel Data");
        //                         }
        //                     }
        //                 })

        //             )


        //         }
                
                

        //         if (result.PromotionVideo) {
        //             await Promise.all(
        //                 result.PromotionVideo.map(async (item) => {
        //                     if (item.PromotionVideoID) {
        //                         const GetPromotionVideoData = await promotionvideo.findOne({
        //                             where: { PromotionID: id, PromotionVideoID: item.PromotionVideoID },
        //                         });
        //                         if (!GetPromotionVideoData) {
        //                             return res
        //                                 .status(400)
        //                                 .send({
        //                                     ErrorCode: "REQUEST",
        //                                     message: "PromotionVideo Data not found",
        //                                 });
        //                         }
        //                         const CreatePromotionVideoHistoryData = await promotionvideohistory.create(
        //                             GetPromotionVideoData.dataValues
        //                         );
        //                         if (!CreatePromotionVideoHistoryData) {
        //                             return res
        //                                 .status(400)
        //                                 .send({
        //                                     ErrorCode: "REQUEST",
        //                                     message: "PromotionVideo History Data Not insert in History Table",
        //                                 });
        //                         }
        //                         if (GetPromotionVideoData.Files) {
        //                             if (GetPromotionVideoData.ImgFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionVideoData.ImgFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                             if (GetPromotionVideoData.VideoFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionVideoData.VideoFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                             if (GetPromotionVideoData.SubtitleFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionVideoData.SubtitleFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                         }
        //                         return promotionvideo.update({
        //                             Title: item.Title ?? undefined,
        //                             Description: item.Description ?? undefined,
        //                             CTA: item.CTA ?? undefined,
        //                             CreatedBy: AccDetails.FirstName,
        //                             LastModifiedBy: AccDetails.FirstName,
        //                         }, { where: { PromotionID: id, PromotionVideoID: item.PromotionVideoID } });
        //                     }
        //                     else {
        //                         const createPromotionVideo = promotionvideo.create({
        //                             PromotionID: id,
        //                             Title: item.Title ?? undefined,
        //                             Description: item.Description ?? undefined,
        //                             CTA: item.CTA ?? undefined,
        //                             ImgFile: item.ImgFile ?? undefined,
        //                             VideoFile: item.VideoFile ?? undefined,
        //                             SubtitleFile: item.SubtitleFile ?? undefined,
        //                             CreatedBy: AccDetails.FirstName,
        //                             LastModifiedBy: AccDetails.FirstName,
        //                         });
        //                         if (!createPromotionVideo) {
        //                             error.push("Error inserting promotion video Data");
        //                         }
        //                     }
        //                 })

        //             )
        //         }

        //         if (result.PromotionOnboardingVideo) {
        //             await Promise.all(
        //                 result.PromotionOnboardingVideo.map(async (item) => {
        //                     if (item.PromotionOnboardingVideoID) {
        //                         const GetPromotionOnboardingVideoData = await promotiononboardingvideo.findOne({
        //                             where: { PromotionID: id, PromotionOnboardingVideoID: item.PromotionOnboardingVideoID },
        //                         });
        //                         if (!GetPromotionOnboardingVideoData) {
        //                             return res
        //                                 .status(400)
        //                                 .send({
        //                                     ErrorCode: "REQUEST",
        //                                     message: "PromotionOnBordingVideo Data not found",
        //                                 });
        //                         }
        //                         const CreatePromotionOnboardingVideoHistoryData = await promotiononboardingvideohistory.create(
        //                             GetPromotionOnboardingVideoData.dataValues
        //                         );
        //                         if (!CreatePromotionOnboardingVideoHistoryData) {
        //                             return res
        //                                 .status(400)
        //                                 .send({
        //                                     ErrorCode: "REQUEST",
        //                                     message: "PromotionOnBordingVideo History Data Not insert in History Table",
        //                                 });
        //                         }
        //                         if (GetPromotionOnboardingVideoData.Files) {
        //                             if (GetPromotionOnboardingVideoData.ImgFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionOnboardingVideoData.ImgFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                             if (GetPromotionOnboardingVideoData.VideoFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionOnboardingVideoData.VideoFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                             if (GetPromotionOnboardingVideoData.SubtitleFile) {
        //                                 const parentDir = path.join(__dirname, '..');
        //                                 const imagePath = parentDir + "/upload/" + GetPromotionOnboardingVideoData.SubtitleFile;
        //                                 await fs.unlinkSync(imagePath);
        //                             }
        //                         }
        //                         return promotiononboardingvideo.update({
        //                             Title: item.Title ?? undefined,
        //                             Description: item.Description ?? undefined,
        //                             CTA: item.CTA ?? undefined,
        //                             CreatedBy: AccDetails.FirstName,
        //                             LastModifiedBy: AccDetails.FirstName,
        //                         }, { where: { PromotionID: id, PromotionOnboardingVideoID: item.PromotionOnboardingVideoID } });
        //                     }
        //                     else {
        //                         const createPromotionOnboardingVideo = promotiononboardingvideo.create({
        //                             PromotionID: id,
        //                             Title: item.Title ?? undefined,
        //                             Description: item.Description ?? undefined,
        //                             CTA: item.CTA ?? undefined,
        //                             ImgFile: item.ImgFile ?? undefined,
        //                             VideoFile: item.VideoFile ?? undefined,
        //                             SubtitleFile: item.SubtitleFile ?? undefined,
        //                             CreatedBy: AccDetails.FirstName,
        //                             LastModifiedBy: AccDetails.FirstName,
        //                         });
        //                         if (!createPromotionOnboardingVideo) {
        //                             error.push("Error inserting promotion on bordingvideo Data");
        //                         }
        //                     }
        //                 })

        //             )
        //         }

                
                
        //         // Example usage
        //         // handlePromotionOnboardingVideo(result, id, AccDetails, res, promotiononboardingvideo, promotiononboardingvideohistory, path, fs);
                
        //     }

        //     return res.status(200).json({
        //         Message: "Promotion information Update successfully!",
        //     });

        // } catch (error) {
        //     // console.log("message" ,error.message, "Error", error);
        //     return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    // }
    try {
        const { AccDetails } = req;

        // if (AccDetails.AccountType !== "Admin") {
        //     return res.status(404).json({ message: "Login With Admin Email And Password." });
        // }

        
        const id = req.params.id;
        const result = req.body;
        const { Mt,VMt, SMt, PVI, PVFILE, PVSUB,POBORDING, POBORDINGV, POBORDINGSUB } = req;
        
        const GetPromotionData = await promotion.findOne({
            where: { PromotionID: id },
        });
        if (!GetPromotionData) {
            return res
                .status(400)
                .send({
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
                .send({
                    ErrorCode: "REQUEST",
                    message: "Promotion Data Not insert in History Table",
                });
        }
        const UpdatePromotionData = await promotion.update(
            {
                CTA: result.CTA ?? undefined,
                PromotionTitle: result.PromotionTitle ?? undefined,
                AccountType: result.AccountType ?? undefined,
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

        if (UpdatePromotionData) {
            //console.log('image-----1');
            if (result.PromotionCarousel) {
                var promotionjsonimg = JSON.parse(result.PromotionCarousel);
            
                // Create mappings for ImgFile, VideoFile, and SubtitleFile based on positions
                let imgFileMapping = {};
                if (Mt && Mt.length > 0) {
                    Mt.forEach((file) => {
                        const index = file.split("_").pop().replace('.jpg', '').replace('.png', '');
                        imgFileMapping[index] = file;
                    });
                }
            
                let videoFileMapping = {};
                if (VMt && VMt.length > 0) {
                    VMt.forEach((file) => {
                        const index = file.split("_").pop().replace('.mp4', '');
                        videoFileMapping[index] = file;
                    });
                }
            
                let subtitleFileMapping = {};
                if (SMt && SMt.length > 0) {
                    SMt.forEach((file) => {
                        const index = file.split("_").pop().replace('.txt', '');
                        subtitleFileMapping[index] = file;
                    });
                }
            
                await Promise.all(
                    promotionjsonimg.map(async (item) => {


                        const GetPromotionCarouselData = await promotioncarousel.findOne({
                            where: { PromotionID: id},
                        });
        
                        // if (!GetPromotionCarouselData) {
                        //     return res.status(400).send({
                        //         ErrorCode: "REQUEST",
                        //         message: "Promotion Carousel Data not found",
                        //     });
                        // }
                        if (GetPromotionCarouselData) {
                            const CreatePromotionCarouselHistoryData = await promotioncarouselhistory.create(
                                GetPromotionCarouselData.dataValues
                            );
                        
                            if (!CreatePromotionCarouselHistoryData) {
                                return res.status(400).send({
                                    ErrorCode: "REQUEST",
                                    message: "Promotion Carousel History Data Not inserted in History Table",
                                });
                            }
                        }

                        const deletedata = await promotioncarousel.destroy({ where: { PromotionID: id } });
                        if (item.PromotionCarouselID) {
                            // const GetPromotionCarouselData = await promotioncarousel.findOne({
                            //     where: { PromotionID: id, PromotionCarouselID: item.PromotionCarouselID },
                            // });
            
                            // if (!GetPromotionCarouselData) {
                            //     return res.status(400).send({
                            //         ErrorCode: "REQUEST",
                            //         message: "Promotion Carousel Data not found",
                            //     });
                            // }
            
                            // const CreatePromotionCarouselHistoryData = await promotioncarouselhistory.create(
                            //     GetPromotionCarouselData.dataValues
                            // );
            
                            // if (!CreatePromotionCarouselHistoryData) {
                            //     return res.status(400).send({
                            //         ErrorCode: "REQUEST",
                            //         message: "Promotion Carousel History Data Not inserted in History Table",
                            //     });
                            // }
            
                            await promotioncarousel.update({
                                Title: item.Title ?? undefined,
                                Description: item.Description ?? undefined,
                                CTA: item.CTA ?? undefined,
                                ImgFile: imgFileMapping[item.position] ?? GetPromotionCarouselData.ImgFile,
                                VideoFile: videoFileMapping[item.position] ?? GetPromotionCarouselData.VideoFile,
                                SubtitleFile: subtitleFileMapping[item.position] ?? GetPromotionCarouselData.SubtitleFile,
                                CreatedBy: AccDetails.FirstName,
                                LastModifiedBy: AccDetails.FirstName,
                            }, { where: { PromotionID: id, PromotionCarouselID: item.PromotionCarouselID } });
            
                        } else {
                            const createpromotioncarousel = await promotioncarousel.create({
                                PromotionID: id,
                                Title: item.Title ?? undefined,
                                Description: item.Description ?? undefined,
                                CTA: item.CTA ?? undefined,
                                ImgFile: imgFileMapping[item.position] ?? undefined,
                                VideoFile: videoFileMapping[item.position] ?? undefined,
                                SubtitleFile: subtitleFileMapping[item.position] ?? undefined,
                                CreatedBy: AccDetails.FirstName,
                                LastModifiedBy: AccDetails.FirstName,
                            });
            
                            if (!createpromotioncarousel) {
                                error.push("Error inserting promotion carousel Data");
                            }
                        }
                    })
                );
            }
            
            

            
        
            if (result.PromotionVideo) {
                var promotionjsonvideo = JSON.parse(result.PromotionVideo);
            
                // Create mappings for ImgFile, VideoFile, and SubtitleFile based on positions
                let imgFileMapping = {};
                if (PVI && PVI.length > 0) {
                    PVI.forEach((file) => {
                        const index = file.split("_").pop().replace('.jpg', '').replace('.png', '');
                        imgFileMapping[index] = file;
                    });
                }
            
                let videoFileMapping = {};
                if (PVFILE && PVFILE.length > 0) {
                    PVFILE.forEach((file) => {
                        const index = file.split("_").pop().replace('.mp4', '');
                        videoFileMapping[index] = file;
                    });
                }
            
                let subtitleFileMapping = {};
                if (PVSUB && PVSUB.length > 0) {
                    PVSUB.forEach((file) => {
                        const index = file.split("_").pop().replace('.txt', '');
                        subtitleFileMapping[index] = file;
                    });
                }
            
                await Promise.all(
                    promotionjsonvideo.map(async (item) => {

                        const GetPromotionVideoData = await promotionvideo.findOne({
                            where: { PromotionID: id},
                        });
        
                        // if (!GetPromotionVideoData) {
                        //     return res.status(400).send({
                        //         ErrorCode: "REQUEST",
                        //         message: "PromotionVideo Data not found",
                        //     });
                        // }
                        if (GetPromotionVideoData) {
                            const CreatePromotionVideoHistoryData = await promotionvideohistory.create(
                                GetPromotionVideoData.dataValues
                            );
            
                            if (!CreatePromotionVideoHistoryData) {
                                return res.status(400).send({
                                    ErrorCode: "REQUEST",
                                    message: "PromotionVideo History Data Not inserted in History Table",
                                });
                            }
                        }
                        const deletedata = await promotionvideo.destroy({ where: { PromotionID: id } });
                        if (item.PromotionVideoID) {
                            // const GetPromotionVideoData = await promotionvideo.findOne({
                            //     where: { PromotionID: id, PromotionVideoID: item.PromotionVideoID },
                            // });
            
                            // if (!GetPromotionVideoData) {
                            //     return res.status(400).send({
                            //         ErrorCode: "REQUEST",
                            //         message: "PromotionVideo Data not found",
                            //     });
                            // }
            
                            // const CreatePromotionVideoHistoryData = await promotionvideohistory.create(
                            //     GetPromotionVideoData.dataValues
                            // );
            
                            // if (!CreatePromotionVideoHistoryData) {
                            //     return res.status(400).send({
                            //         ErrorCode: "REQUEST",
                            //         message: "PromotionVideo History Data Not inserted in History Table",
                            //     });
                            // }
            
                            await promotionvideo.update({
                                Title: item.Title ?? undefined,
                                Description: item.Description ?? undefined,
                                CTA: item.CTA ?? undefined,
                                ImgFile: imgFileMapping[item.position] ?? GetPromotionVideoData.ImgFile,
                                VideoFile: videoFileMapping[item.position] ?? GetPromotionVideoData.VideoFile,
                                SubtitleFile: subtitleFileMapping[item.position] ?? GetPromotionVideoData.SubtitleFile,
                                CreatedBy: AccDetails.FirstName,
                                LastModifiedBy: AccDetails.FirstName,
                            }, { where: { PromotionID: id, PromotionVideoID: item.PromotionVideoID } });
            
                        } else {
                            const createPromotionVideo = await promotionvideo.create({
                                PromotionID: id,
                                Title: item.Title ?? undefined,
                                Description: item.Description ?? undefined,
                                CTA: item.CTA ?? undefined,
                                ImgFile: imgFileMapping[item.position] ?? undefined,
                                VideoFile: videoFileMapping[item.position] ?? undefined,
                                SubtitleFile: subtitleFileMapping[item.position] ?? undefined,
                                CreatedBy: AccDetails.FirstName,
                                LastModifiedBy: AccDetails.FirstName,
                            });
            
                            if (!createPromotionVideo) {
                                error.push("Error inserting promotion video Data");
                            }
                        }
                    })
                );
            }
            
            

            
           
            if (result.PromotionOnboardingVideo) {
                var promotionjsonOnboardingVideo = JSON.parse(result.PromotionOnboardingVideo);
            
                // Create mappings for ImgFile, VideoFile, and SubtitleFile based on positions
                let imgFileMapping = {};
                if (POBORDING && POBORDING.length > 0) {
                    POBORDING.forEach((file) => {
                        const index = file.split("_").pop().replace('.jpg', '').replace('.png', '');
                        imgFileMapping[index] = file;
                    });
                }
            
                let videoFileMapping = {};
                if (POBORDINGV && POBORDINGV.length > 0) {
                    POBORDINGV.forEach((file) => {
                        const index = file.split("_").pop().replace('.mp4', '');
                        videoFileMapping[index] = file;
                    });
                }
            
                let subtitleFileMapping = {};
                if (POBORDINGSUB && POBORDINGSUB.length > 0) {
                    POBORDINGSUB.forEach((file) => {
                        const index = file.split("_").pop().replace('.txt', '');
                        subtitleFileMapping[index] = file;
                    });
                }
            
                await Promise.all(
                    promotionjsonOnboardingVideo.map(async (item) => {

                        const GetPromotionOnboardingVideoData = await promotiononboardingvideo.findOne({
                            where: { PromotionID: id},
                        });
        
                        // if (!GetPromotionOnboardingVideoData) {
                        //     return res.status(400).send({
                        //         ErrorCode: "REQUEST",
                        //         message: "PromotionOnboardingVideo Data not found",
                        //     });
                        // }
                        if (GetPromotionOnboardingVideoData) {
                            const CreatePromotionOnboardingVideoHistoryData = await promotiononboardingvideohistory.create(
                                GetPromotionOnboardingVideoData.dataValues
                            );
            
                            if (!CreatePromotionOnboardingVideoHistoryData) {
                                return res.status(400).send({
                                    ErrorCode: "REQUEST",
                                    message: "PromotionOnboardingVideo History Data Not inserted in History Table",
                                });
                            }
                        }

                        const deletedata = await promotiononboardingvideo.destroy({ where: { PromotionID: id } });
                        if (item.PromotionOnboardingVideoID) {
                            // const GetPromotionOnboardingVideoData = await promotiononboardingvideo.findOne({
                            //     where: { PromotionID: id, PromotionOnboardingVideoID: item.PromotionOnboardingVideoID },
                            // });
            
                            // if (!GetPromotionOnboardingVideoData) {
                            //     return res.status(400).send({
                            //         ErrorCode: "REQUEST",
                            //         message: "PromotionOnboardingVideo Data not found",
                            //     });
                            // }
            
                            // const CreatePromotionOnboardingVideoHistoryData = await promotiononboardingvideohistory.create(
                            //     GetPromotionOnboardingVideoData.dataValues
                            // );
            
                            // if (!CreatePromotionOnboardingVideoHistoryData) {
                            //     return res.status(400).send({
                            //         ErrorCode: "REQUEST",
                            //         message: "PromotionOnboardingVideo History Data Not inserted in History Table",
                            //     });
                            // }
            
                            await promotiononboardingvideo.update({
                                Title: item.Title ?? undefined,
                                Description: item.Description ?? undefined,
                                CTA: item.CTA ?? undefined,
                                ImgFile: imgFileMapping[item.position] ?? GetPromotionOnboardingVideoData.ImgFile,
                                VideoFile: videoFileMapping[item.position] ?? GetPromotionOnboardingVideoData.VideoFile,
                                SubtitleFile: subtitleFileMapping[item.position] ?? GetPromotionOnboardingVideoData.SubtitleFile,
                                CreatedBy: AccDetails.FirstName,
                                LastModifiedBy: AccDetails.FirstName,
                            }, { where: { PromotionID: id, PromotionOnboardingVideoID: item.PromotionOnboardingVideoID } });
            
                        } else {
                            const createPromotionOnboardingVideo = await promotiononboardingvideo.create({
                                PromotionID: id,
                                Title: item.Title ?? undefined,
                                Description: item.Description ?? undefined,
                                CTA: item.CTA ?? undefined,
                                ImgFile: imgFileMapping[item.position] ?? undefined,
                                VideoFile: videoFileMapping[item.position] ?? undefined,
                                SubtitleFile: subtitleFileMapping[item.position] ?? undefined,
                                CreatedBy: AccDetails.FirstName,
                                LastModifiedBy: AccDetails.FirstName,
                            });
            
                            if (!createPromotionOnboardingVideo) {
                                error.push("Error inserting promotion onboarding video Data");
                            }
                        }
                    })
                );
            }
                      
        }

        return res.status(200).json({
            Message: "Promotion information Update successfully!",
        });

    } catch (error) {
        // console.log("message" ,error.message, "Error", error);
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};
const DeleteRequest = async (req, res) => {
    try {
        const { AccDetails } = req;

        // if (AccDetails.AccountType !== "Admin") {
        //     return res.status(404).json({ message: "Login With Admin Email And Password." });
        // }
        const id = req.params.id;
        console.log(id);
        const GetPromotionData = await promotion.findOne({
            where: { PromotionID: id },
        });
        console.log(GetPromotionData);
        if (!GetPromotionData) {
            return res
                .status(400)
                .send({
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
                .send({
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
                .send({
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
                    .send({ ErrorCode: "REQUEST", message: "PromotionCarousel Data not found" });
            }
            const CreatePromotionCarouselHistoryData = await promotioncarouselhistory.create(
                GetPromotionCarouselData.dataValues
            );
            if (!CreatePromotionCarouselHistoryData) {
                return res
                    .status(400)
                    .send({
                        ErrorCode: "REQUEST",
                        message: "PromotionCarousel Data Not insert in History Table",
                    });
            }
            if (GetPromotionCarouselData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionCarouselData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionCarouselData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }
            const DeletePromotionCarouselData = await promotioncarousel.destroy({
                where: { PromotionID: PromotionID, PromotionCarouselID: ModuleID },
            });
            if (!DeletePromotionCarouselData) {
                return res
                    .status(400)
                    .send({
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
                    .send({ ErrorCode: "REQUEST", message: "Promotionvideo Data not found" });
            }
            const CreatePromotionvideoHistoryData = await promotionvideohistory.create(
                GetPromotionvideoData.dataValues
            );
            if (!CreatePromotionvideoHistoryData) {
                return res
                    .status(400)
                    .send({
                        ErrorCode: "REQUEST",
                        message: "Promotion Data Not insert in History Table",
                    });
            }
            if (GetPromotionvideoData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionvideoData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionvideoData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionvideoData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionvideoData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionvideoData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }

            const DeletePromotionvideoData = await promotionvideo.destroy({
                where: { PromotionID: PromotionID, PromotionVideoID: ModuleID },
            });
            if (!DeletePromotionvideoData) {
                return res
                    .status(400)
                    .send({
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
                    .send({ ErrorCode: "REQUEST", message: "PromotionOnBoardingVideo Data not found" });
            }
            const CreatePromotionOnBoardingVideoHistoryData = await promotiononboardingvideohistory.create(
                GetPromotionOnBoardingVideoData.dataValues
            );
            if (!CreatePromotionOnBoardingVideoHistoryData) {
                return res
                    .status(400)
                    .send({
                        ErrorCode: "REQUEST",
                        message: "Promotion Data Not insert in History Table",
                    });
            }

            if (GetPromotionOnBoardingVideoData.ImgFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionOnBoardingVideoData.ImgFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionOnBoardingVideoData.VideoFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionOnBoardingVideoData.VideoFile;
                await fs.unlinkSync(imagePath);
            }
            if (GetPromotionOnBoardingVideoData.SubtitleFile) {
                const parentDir = path.join(__dirname, '..');
                const imagePath = parentDir + "/upload/" + GetPromotionOnBoardingVideoData.SubtitleFile;
                await fs.unlinkSync(imagePath);
            }
            const DeletePromotionOnBoardingVideoData = await promotiononboardingvideo.destroy({
                where: { PromotionID: PromotionID, PromotionOnboardingVideoID: ModuleID },
            });
            if (!DeletePromotionOnBoardingVideoData) {
                return res
                    .status(400)
                    .send({
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



// Upload Promotion File

// async function uploadPromotionFiles(req, res, next) {
//     try {
//         if (req.files) {
//             console.log(`------------<>-------------`);
//             console.log(req.files);
//             console.log(`------------<>-------------`);

//             const moduleArray = [];
//             const moduleVideoArray = [];
//             const subtitleArray = [];

//             const uploadDir = path.join(__dirname, '..', 'upload');

//             const processFile = async (file, type) => {
//                 const fileNameParts = file.name.split("_");
//                 const fileBaseName = fileNameParts[0];
//                 const filePosition = fileNameParts[fileNameParts.length - 1];

//                 if (type === 'Thumbnail') {
//                     if (['PromotionCarouselThumbnail', 'PromotionVideoThumbnail', 'PromotionOnboardingThumbnail'].includes(fileBaseName)) {
//                         moduleArray.push(file.name);
//                         req.Mt = moduleArray;
//                     }
//                 } else if (type === 'Video') {
//                     if (['PromotionCarouselVideo', 'PromotionVideoVideo', 'PromotionOnboardingVideo', 'ModuleVideo'].includes(fileBaseName)) {
//                         moduleVideoArray.push(file.name);
//                         req.Mv = moduleVideoArray;
//                     }
//                 } else if (type === 'Subtitle') {
//                     if (['PromotionCarouselSubtitle', 'PromotionVideoSubtitle', 'PromotionOnboardingVideoSubtitle', 'ModuleSubtitle'].includes(fileBaseName)) {
//                         subtitleArray.push(file.name);
//                         req.Mt = subtitleArray;
//                     }
//                 }

//                 await file.mv(path.join(uploadDir, `${Date.now()}_${file.name}`));
//             };

//             if (req.files.Thumbnail) {
//                 await Promise.all(req.files.Thumbnail.map(file => processFile(file, 'Thumbnail')));
//             }
//             if (req.files.Video) {
//                 await Promise.all(req.files.Video.map(file => processFile(file, 'Video')));
//             }
//             if (req.files.Subtitle) {
//                 await Promise.all(req.files.Subtitle.map(file => processFile(file, 'Subtitle')));
//             }

//             next();
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Sorry! There was an error while uploading files"
//         });
//     }
// }

// async function uploadPromotionFiles(req, res, next) {
//     try {
//         if (req.files) {
           
//             const moduleArray = [];
//             const moduleVideoArray = [];
//             const subtitleArray = [];

            
//             // Image
//                 if (req.files.ImgFile) {
//                     const imageFile = Array.isArray(req.files.ImgFile) ? req.files.ImgFile : [req.files.ImgFile];
//                     await Promise.all(imageFile.map(async (singleThumbFile) => {
//                         let imageReqArray = singleThumbFile.name.split("_");
//                         const imgName = imageReqArray[0];
//                         if (imgName === "PromotionThumbnail") {
//                             const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                             if (!req.Mt) {
//                                 req.Mt = [];
//                             }
//                             req.Mt.push(singleThumbFile.name);
//                             await singleThumbFile.mv(path.join(uploadDir, singleThumbFile.name));
//                         }
//                     }));
//                 }

//                 if (req.files.promotionImgFile) {
//                     const imageFile = Array.isArray(req.files.promotionImgFile) ? req.files.promotionImgFile : [req.files.promotionImgFile];
//                     await Promise.all(imageFile.map(async (singleThumbFile) => {
//                         let imageReqArray = singleThumbFile.name.split("_");
//                         const imgName = imageReqArray[0];
//                         if (imgName === "PromotionImage") {
//                             const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                             if (!req.PVI) {
//                                 req.PVI = [];
//                             }
//                             req.PVI.push(singleThumbFile.name);
//                             await singleThumbFile.mv(path.join(uploadDir, singleThumbFile.name));
//                         }
//                     }));
//                 }

//                 if (req.files.promotionOnbordingImgFile) {
//                     const imageFile = Array.isArray(req.files.promotionOnbordingImgFile) ? req.files.promotionOnbordingImgFile : [req.files.promotionOnbordingImgFile];
//                     await Promise.all(imageFile.map(async (singleThumbFile) => {
//                         let imageReqArray = singleThumbFile.name.split("_");
//                         const imgName = imageReqArray[0];
//                         if (imgName === "PromotionOnbordingImage") {
//                             const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                             if (!req.POBORDING) {
//                                 req.POBORDING = [];
//                             }
//                             req.POBORDING.push(singleThumbFile.name);
//                             await singleThumbFile.mv(path.join(uploadDir, singleThumbFile.name));
//                         }
//                     }));
//                 }




//             //video    
//             if (req.files.VideoFile) {
//                 const imageFile = Array.isArray(req.files.VideoFile) ? req.files.VideoFile : [req.files.VideoFile];
//                 await Promise.all(imageFile.map(async (singleVideoFile) => {
//                     let videoReqArray = singleVideoFile.name.split("_");
//                     const videoName = videoReqArray[0];
//                     if (videoName === "PromotionVideo") {
//                         const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                         if (!req.VMt) {
//                             req.VMt = [];
//                         }
//                         req.VMt.push(singleVideoFile.name);
//                         await singleVideoFile.mv(path.join(uploadDir, singleVideoFile.name));
//                     }
//                 }));
//             }

//             if (req.files.promotionVideoFile) {
//                 const imageFile = Array.isArray(req.files.promotionVideoFile) ? req.files.promotionVideoFile : [req.files.promotionVideoFile];
//                 await Promise.all(imageFile.map(async (singleVideoFile) => {
//                     let videoReqArray = singleVideoFile.name.split("_");
//                     const videoName = videoReqArray[0];
//                     if (videoName === "PromotionVideoFIle") {
//                         const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                         if (!req.PVFILE) {
//                             req.PVFILE = [];
//                         }
//                         req.PVFILE.push(singleVideoFile.name);
//                         await singleVideoFile.mv(path.join(uploadDir, singleVideoFile.name));
//                     }
//                 }));
//             }

//             if (req.files.promotionOnbordingVideoFile) {
//                 const imageFile = Array.isArray(req.files.promotionOnbordingVideoFile) ? req.files.promotionOnbordingVideoFile : [req.files.promotionOnbordingVideoFile];
//                 await Promise.all(imageFile.map(async (singleVideoFile) => {
//                     let videoReqArray = singleVideoFile.name.split("_");
//                     const videoName = videoReqArray[0];
//                     if (videoName === "promotionOnbordingVideoFile") {
//                         const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                         if (!req.POBORDINGV) {
//                             req.POBORDINGV = [];
//                         }
//                         req.POBORDINGV.push(singleVideoFile.name);
//                         await singleVideoFile.mv(path.join(uploadDir, singleVideoFile.name));
//                     }
//                 }));
//             }

            
//             //Sub Title
//             if (req.files.SubtitleFile) {
//                 const subtitleFile = Array.isArray(req.files.SubtitleFile) ? req.files.SubtitleFile : [req.files.SubtitleFile];
//                 await Promise.all(subtitleFile.map(async (singleSub) => {
//                     let subReqArray = singleSub.name.split("_");
//                     const subName = subReqArray[0];
//                     if (subName === "PromotionSubtitle") {
//                         const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                         if (!req.SMt) {
//                             req.SMt = [];
//                         }
//                         req.SMt.push(singleSub.name);
//                         await singleSub.mv(path.join(uploadDir, singleSub.name));
//                     }
//                 }));
//             }

//             if (req.files.PromotionSubtitleFile) {
//                 const PromotionSubtitleFile = Array.isArray(req.files.PromotionSubtitleFile) ? req.files.PromotionSubtitleFile : [req.files.PromotionSubtitleFile];
//                 await Promise.all(PromotionSubtitleFile.map(async (singleSub) => {
//                     let subReqArray = singleSub.name.split("_");
//                     const subName = subReqArray[0];
//                     if (subName === "PromotionSubtitleFile") {
//                         const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                         if (!req.PVSUB) {
//                             req.PVSUB = [];
//                         }
//                         req.PVSUB.push(singleSub.name);
//                         await singleSub.mv(path.join(uploadDir, singleSub.name));
//                     }
//                 }));
//             }

//             if (req.files.promotionOnbordingSubtitleFile) {
//                 const promotionOnbordingSubtitleFile = Array.isArray(req.files.promotionOnbordingSubtitleFile) ? req.files.promotionOnbordingSubtitleFile : [req.files.promotionOnbordingSubtitleFile];
//                 await Promise.all(promotionOnbordingSubtitleFile.map(async (singleSub) => {
//                     let subReqArray = singleSub.name.split("_");
//                     const subName = subReqArray[0];
//                     if (subName === "promotionOnbordingSubtitleFile") {
//                         const uploadDir = path.join(__dirname, '..', 'promotionUpload');
//                         if (!req.POBORDINGSUB) {
//                             req.POBORDINGSUB = [];
//                         }
//                         req.POBORDINGSUB.push(singleSub.name);
//                         await singleSub.mv(path.join(uploadDir, singleSub.name));
//                     }
//                 }));
//             }
//             next();
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Sorry! There was an error while uploading files"
//         });
//     }
// }


async function uploadPromotionFiles(req, res, next) {
    try {
        if (req.files) {
           
            const moduleArray = [];
            const moduleVideoArray = [];
            const subtitleArray = [];

            
            // Image
                if (req.files.ImgFile) {
                    const imageFile = Array.isArray(req.files.ImgFile) ? req.files.ImgFile : [req.files.ImgFile];
                    await Promise.all(imageFile.map(async (singleThumbFile) => {
                        let imageReqArray = singleThumbFile.name.split("_");
                        const imgName = imageReqArray[0];
                        if (imgName === "CarouselThumbnail") {
                            const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                            if (!req.Mt) {
                                req.Mt = [];
                            }
                            req.Mt.push(singleThumbFile.name);
                            await singleThumbFile.mv(path.join(uploadDir, singleThumbFile.name));
                        }
                    }));
                }

                if (req.files.promotionImgFile) {
                    const imageFile = Array.isArray(req.files.promotionImgFile) ? req.files.promotionImgFile : [req.files.promotionImgFile];
                    await Promise.all(imageFile.map(async (singleThumbFile) => {
                        let imageReqArray = singleThumbFile.name.split("_");
                        const imgName = imageReqArray[0];
                        if (imgName === "PromotionVideoThumbnail") {
                            const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                            if (!req.PVI) {
                                req.PVI = [];
                            }
                            req.PVI.push(singleThumbFile.name);
                            await singleThumbFile.mv(path.join(uploadDir, singleThumbFile.name));
                        }
                    }));
                }

                if (req.files.promotionOnbordingImgFile) {
                    const imageFile = Array.isArray(req.files.promotionOnbordingImgFile) ? req.files.promotionOnbordingImgFile : [req.files.promotionOnbordingImgFile];
                    await Promise.all(imageFile.map(async (singleThumbFile) => {
                        let imageReqArray = singleThumbFile.name.split("_");
                        const imgName = imageReqArray[0];
                        if (imgName === "OnboardingThumbnail") {
                            const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                            if (!req.POBORDING) {
                                req.POBORDING = [];
                            }
                            req.POBORDING.push(singleThumbFile.name);
                            await singleThumbFile.mv(path.join(uploadDir, singleThumbFile.name));
                        }
                    }));
                }




            //video    
            if (req.files.VideoFile) {
                const imageFile = Array.isArray(req.files.VideoFile) ? req.files.VideoFile : [req.files.VideoFile];
                await Promise.all(imageFile.map(async (singleVideoFile) => {
                    let videoReqArray = singleVideoFile.name.split("_");
                    const videoName = videoReqArray[0];
                    if (videoName === "CarouselVideo") {
                        const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                        if (!req.VMt) {
                            req.VMt = [];
                        }
                        req.VMt.push(singleVideoFile.name);
                        await singleVideoFile.mv(path.join(uploadDir, singleVideoFile.name));
                    }
                }));
            }

            if (req.files.promotionVideoFile) {
                const imageFile = Array.isArray(req.files.promotionVideoFile) ? req.files.promotionVideoFile : [req.files.promotionVideoFile];
                await Promise.all(imageFile.map(async (singleVideoFile) => {
                    let videoReqArray = singleVideoFile.name.split("_");
                    const videoName = videoReqArray[0];
                    if (videoName === "PromotionVideoVideo") {
                        const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                        if (!req.PVFILE) {
                            req.PVFILE = [];
                        }
                        req.PVFILE.push(singleVideoFile.name);
                        await singleVideoFile.mv(path.join(uploadDir, singleVideoFile.name));
                    }
                }));
            }

            if (req.files.promotionOnbordingVideoFile) {
                const imageFile = Array.isArray(req.files.promotionOnbordingVideoFile) ? req.files.promotionOnbordingVideoFile : [req.files.promotionOnbordingVideoFile];
                await Promise.all(imageFile.map(async (singleVideoFile) => {
                    let videoReqArray = singleVideoFile.name.split("_");
                    const videoName = videoReqArray[0];
                    if (videoName === "OnboardingVideo") {
                        const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                        if (!req.POBORDINGV) {
                            req.POBORDINGV = [];
                        }
                        req.POBORDINGV.push(singleVideoFile.name);
                        await singleVideoFile.mv(path.join(uploadDir, singleVideoFile.name));
                    }
                }));
            }

            
            //Sub Title
            if (req.files.SubtitleFile) {
                const subtitleFile = Array.isArray(req.files.SubtitleFile) ? req.files.SubtitleFile : [req.files.SubtitleFile];
                await Promise.all(subtitleFile.map(async (singleSub) => {
                    let subReqArray = singleSub.name.split("_");
                    const subName = subReqArray[0];
                    if (subName === "CarouselSubtitle") {
                        const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                        if (!req.SMt) {
                            req.SMt = [];
                        }
                        req.SMt.push(singleSub.name);
                        await singleSub.mv(path.join(uploadDir, singleSub.name));
                    }
                }));
            }

            if (req.files.PromotionSubtitleFile) {
                const PromotionSubtitleFile = Array.isArray(req.files.PromotionSubtitleFile) ? req.files.PromotionSubtitleFile : [req.files.PromotionSubtitleFile];
                await Promise.all(PromotionSubtitleFile.map(async (singleSub) => {
                    let subReqArray = singleSub.name.split("_");
                    const subName = subReqArray[0];
                    if (subName === "PromotionVideoSubtitle") {
                        const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                        if (!req.PVSUB) {
                            req.PVSUB = [];
                        }
                        req.PVSUB.push(singleSub.name);
                        await singleSub.mv(path.join(uploadDir, singleSub.name));
                    }
                }));
            }

            if (req.files.promotionOnbordingSubtitleFile) {
                const promotionOnbordingSubtitleFile = Array.isArray(req.files.promotionOnbordingSubtitleFile) ? req.files.promotionOnbordingSubtitleFile : [req.files.promotionOnbordingSubtitleFile];
                await Promise.all(promotionOnbordingSubtitleFile.map(async (singleSub) => {
                    let subReqArray = singleSub.name.split("_");
                    const subName = subReqArray[0];
                    if (subName === "OnboardingSubtitle") {
                        const uploadDir = path.join(__dirname, '..', 'promotionUpload');
                        if (!req.POBORDINGSUB) {
                            req.POBORDINGSUB = [];
                        }
                        req.POBORDINGSUB.push(singleSub.name);
                        await singleSub.mv(path.join(uploadDir, singleSub.name));
                    }
                }));
            }
            next();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Sorry! There was an error while uploading files"
        });
    }
}

// HTTTP REQUEST

const GetHttpPromotionRequest = async (req, res) => {
    try {

        const id = req.params.id;
        console.log(id);
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
            .send({
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
            order: [['PromotionID', 'DESC']],
        });

        if (promotions && promotions.length > 0) {
            return res.status(200).json({
                Data: promotions,
            });
        } else {
            return res.status(400).json({ Data: "Promotion Data Not Found!" });
        }
    } catch (error) {
        return res.status(400).send({
            ErrorCode: "REQUEST",
            message: error.message,
            Error: error,
        });
    }
}


module.exports = {
    AddRequest,
    GetPromotionsRequest,
    GetPromotionRequest,
    UpdateRequest,
    DeleteRequest,
    DeleteModuleRequest,
    uploadPromotionFiles,
    GetHttpPromotionRequest,
    GetHttpPromotionsRequest
};

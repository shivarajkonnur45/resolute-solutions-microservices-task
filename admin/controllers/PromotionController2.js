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




var express = require('express');
const router = express.Router();
//var multer  =   require('multer');
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


const AddRequest = async (req, res) => {
    try {
        const { AccDetails } = req;

        if (AccDetails.AccountType !== "Admin") {
            return res.status(404).json({ message: "Login With Admin Email And Password." });
        }

        const result = req.body;
        const Ct = req?.Ct;
        const Cet = req?.CeT;
        const Mt = req?.Mt;
        const Tt = req?.Tt;
        const VCt = req?.VCt;
        const VMt = req?.VMt;
        const SMt = req?.SMt;
        // const allPromotionData = await promotion.findAll();
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

        var PromotionCarouselData = JSON.parse(req.body.PromotionCarousel);
        PromotionCarouselData.forEach((promotion, index) => {
            promotion.PromotionID = createdPromotionData.PromotionID;
            promotion.CreatedBy = AccDetails.FirstName;
            promotion.LastModifiedBy = AccDetails.FirstName;
        });

        async function createPromotions() {
            try {
                const createdPromotionData = await promotioncarousel.bulkCreate(PromotionCarouselData);
            } catch (error) {
                console.error('Error creating promotions:', error);
            }
        }
        createPromotions();


        var PromotionVideoData = JSON.parse(req.body.PromotionVideo);
        PromotionVideoData.forEach((promotion, index) => {
            promotion.PromotionID = createdPromotionData.PromotionID;
            promotion.CreatedBy = AccDetails.FirstName;
            promotion.LastModifiedBy = AccDetails.FirstName;
        });

        async function createPromotions2() {
            try {
                const createdPromotionData2 = await promotionvideo.bulkCreate(PromotionVideoData);
            } catch (error) {
                console.error('Error creating promotions:', error);
            }
        }
        createPromotions2();


        var PromotionOnboardingVideoData = JSON.parse(req.body.PromotionOnboardingVideo);
        PromotionOnboardingVideoData.forEach((promotion, index) => {
            promotion.PromotionID = createdPromotionData.PromotionID;
            promotion.CreatedBy = AccDetails.FirstName;
            promotion.LastModifiedBy = AccDetails.FirstName;
        });

        async function createPromotions3() {
            try {
                const createdPromotionData2 = await promotiononboardingvideo.bulkCreate(PromotionOnboardingVideoData);
            } catch (error) {
                console.error('Error creating promotions:', error);
            }
        }
        createPromotions3();
        //const promotiononboardingvideodata = await promotiononboardingvideo.findAll();

        return res.status(200).json({
            Message: "Promotion information added successfully!"
        });
    }
    catch (error) {
        console.log(error);
        return res
            .status(400)
            .send({
                ErrorCode: "REQUEST",
                message: error.message,
                Error: error,
            });
    }
}

const UpdateRequest = async (req, res) => {
    try {
        const { AccDetails } = req;

        if (AccDetails.AccountType !== "Admin") {
            return res.status(404).json({ message: "Login With Admin Email And Password." });
        }
        const id = req.params.id;
        const result = req.body;
        const GetPromotionData = await promotion.findOne({
            where: { PromotionID: id },
        });

        if (!GetPromotionData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Promotion Data not found" });
        }

        const CreatePromotionHistoryData = await promotionhistory.create(
            GetPromotionData.dataValues
        );

        if (!CreatePromotionHistoryData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Promotion Data Not insert in History Table" });
        }

        const UpdatePromotionData = await promotion.update({
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


        //1. Get Carouse data
        const GetPromotionCarouselData_history = await promotioncarousel.findAll({
            where: { PromotionID: id },
        });

        async function createPromotionsHistory() {
            try {
                const createdPromotionData = await promotioncarouselhistory.bulkCreate(GetPromotionCarouselData_history.dataValues);
            } catch (error) {
                console.error('Error creating promotions:', error);
            }
        }

        // const parentDir = path.join(__dirname, '..');
        // const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.ImgFile;
        // await fs.unlinkSync(imagePath);
        // return res.status(200).json(GetPromotionCarouselData_history);

        createPromotionsHistory();
        const deletedata = await promotioncarousel.destroy({ where: { PromotionID: id } });


        var PromotionCarouselData = JSON.parse(req.body.PromotionCarousel);
        PromotionCarouselData.forEach((promotion, index) => {
            promotion.PromotionID = id;
            promotion.CreatedBy = AccDetails.FirstName;
            promotion.LastModifiedBy = AccDetails.FirstName;
        });

        async function createPromotions() {
            try {
                const createdPromotionData = await promotioncarousel.bulkCreate(PromotionCarouselData);
            } catch (error) {
                console.error('Error creating promotions:', error);
            }
        }
        createPromotions();

        //2. Get Promotion video data
        const GetpromotionvideoData_history = await promotionvideo.findAll({
            where: { PromotionID: id },
        });

        var PromotionVideoData = JSON.parse(req.body.PromotionVideo);
        PromotionVideoData.forEach((promotion, index) => {
            promotion.PromotionID = id;
            promotion.CreatedBy = AccDetails.FirstName;
            promotion.LastModifiedBy = AccDetails.FirstName;
        });

        async function createPromotions2_history() {
            try {
                const createdPromotionData2 = await promotionvideohistory.bulkCreate(PromotionVideoData);
            } catch (error) {
                console.error('Error creating promotions:', error);
            }
        }
        createPromotions2_history();

        const deletedata2 = await promotionvideo.destroy({ where: { PromotionID: id } });

        async function createPromotionsVideo() {
            try {
                const createdPromotionData = await promotionvideo.bulkCreate(PromotionCarouselData);
            } catch (error) {
                console.error('Error creating promotions:', error);
            }
        }
        createPromotionsVideo();

        //3 Get OnBoading video data
        const GetpromotionBoardigData_history = await promotiononboardingvideo.findAll({
            where: { PromotionID: id },
        });

        var PromotionOnboardingVideoData = JSON.parse(req.body.PromotionOnboardingVideo);
        PromotionOnboardingVideoData.forEach((promotion, index) => {
            promotion.PromotionID = id;
            promotion.CreatedBy = AccDetails.FirstName;
            promotion.LastModifiedBy = AccDetails.FirstName;
        });


        async function createOnboardingVideo2_history() {
            try {
                const createdPromotionData2 = await promotiononboardingvideohistory.bulkCreate(GetpromotionBoardigData_history);
            } catch (error) {
                console.error('Error creating OnboardingVideo:', error);
            }
        }
        createOnboardingVideo2_history();

        const deletedata3 = await promotiononboardingvideo.destroy({ where: { PromotionID: id } });

        async function createOnboardingVideoVideo() {
            try {
                const createdPromotionData = await promotiononboardingvideo.bulkCreate(PromotionOnboardingVideoData);
            } catch (error) {
                console.error('Error creating OnboardingVideo:', error);
            }
        }
        createOnboardingVideoVideo();

        return res.status(200).json({
            Message: "Promotion information Update successfully!",
        });

    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};


// const upload_file = async(req,res)=>{
//     var storage =   multer.diskStorage({    
//         destination: function (req, file, callback) {
//             callback(null, '../upload');
//         },
//         filename: function (req, file, callback) {
//             let fine_name = Date.now()+'_'+file.originalname;
//             callback(null, fine_name);
//         }
//     });
//     var upload = multer({ storage : storage}).any('userPhoto');

//     //router.post('/upload', (req, res) => {
//         upload(req,res,function(err) {
//             if(err) {
//                 return res.json([[{ "SUCCESS": 0}],[{ "Message": err}]]);
//             }
//             //res.json([[{ "SUCCESS": 1}],req.files]);
//             res.json([req.files]);
//         });
//     //});
//     router.get('/upload', (req, res) => {
//         res.status(200);  
//     });

// }


// const GetPromotionsRequest = async (req, res) => {
//     try {
//         const { AccDetails } = req;

//         if (AccDetails.AccountType !== "Admin") {
//             return res.status(404).json({ message: "Login With Admin Email And Password." });
//         }
//         let { page, pageSize, AccountType } = req.query;

//         //* Set default values for page and pageSize if not provided
//         page = page ? parseInt(page, 10) : 1;

//         pageSize = pageSize ? parseInt(pageSize, 10) : 10;

//         pageSize = pageSize <= 100 ? pageSize : 10;
//         const whereCondition = AccountType ? { AccountType: AccountType } : {};

//         const { count, rows } = await promotion.findAndCountAll({
//             limit: pageSize,
//             offset: (page - 1) * pageSize,
//             where: whereCondition,
//             order: [['PromotionID', 'ASC']]

//         });
//         if (rows !== null) {
//             return res.status(200).json({
//                 TotalCount: count,
//                 page: page,
//                 pageSize: pageSize,
//                 Data: rows,
//             });
//         } else {
//             return res.status(400).json({ Data: "Promotion Data Not Gets!" });
//         }
//     } catch (error) {
//         return res
//             .status(400)
//             .send({
//                 ErrorCode: "REQUEST",
//                 message: error.message,
//                 Error: error,
//             });
//     }
// };


// const GetPromotionRequest = async (req, res) => {
//     try {
//         const { AccDetails } = req;

//         if (AccDetails.AccountType !== "Admin") {
//             return res.status(404).json({ message: "Login With Admin Email And Password." });
//         }
//         const id = req.params.id;
//         console.log(id);
//         const GetPromotionData = await promotion.findOne({
//             where: { PromotionID: id },

//             include: [{
//                 model: promotioncarousel,
//                 as: 'promotioncarousel'
//             }, {
//                 model: promotionvideo,
//                 as: 'promotionvideo'
//             }, {
//                 model: promotiononboardingvideo,
//                 as: 'promotiononboardingvideo',
//             }]
//         });
//         if (GetPromotionData) {
//             return res.status(200).json({
//                 TotalCount: GetPromotionData.length,
//                 Data: GetPromotionData,
//             });
//         } else {
//             return res.status(400).json({ Data: "Promotion Data Not Gets!" });
//         }
//     } catch (error) {
//         return res
//             .status(400)
//             .send({
//                 ErrorCode: "REQUEST",
//                 message: error.message,
//                 Error: error,
//             });
//     }
// };


// const DeleteRequest = async (req, res) => {
//     try {
//         const { AccDetails } = req;

//         if (AccDetails.AccountType !== "Admin") {
//             return res.status(404).json({ message: "Login With Admin Email And Password." });
//         }
//         const id = req.params.id;
//         console.log(id);
//         const GetPromotionData = await promotion.findOne({
//             where: { PromotionID: id },
//         });
//         console.log(GetPromotionData);
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
//         const DeletePromotionData = await promotion.destroy({
//             where: { PromotionID: id },
//         });
//         if (!DeletePromotionData) {
//             return res
//                 .status(400)
//                 .send({
//                     ErrorCode: "REQUEST",
//                     message: "Promotion Data Not deleted",
//                 });
//         }
//         res.status(201).json({ message: "Data Deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const DeleteModuleRequest = async (req, res) => {
//     try {
//         const { AccDetails } = req;

//         if (AccDetails.AccountType !== "Admin") {
//             return res.status(404).json({ message: "Login With Admin Email And Password." });
//         }
//         const { PromotionID, ModuleID } = req.params;
//         const result = req.body;

//         if (result.modulename == "promotioncarousel") {
//             const GetPromotionCarouselData = await promotioncarousel.findOne({
//                 where: { PromotionID: PromotionID, PromotionCarouselID: ModuleID },
//             });
//             if (!GetPromotionCarouselData) {
//                 return res
//                     .status(400)
//                     .send({ ErrorCode: "REQUEST", message: "PromotionCarousel Data not found" });
//             }
//             const CreatePromotionCarouselHistoryData = await promotioncarouselhistory.create(
//                 GetPromotionCarouselData.dataValues
//             );
//             if (!CreatePromotionCarouselHistoryData) {
//                 return res
//                     .status(400)
//                     .send({
//                         ErrorCode: "REQUEST",
//                         message: "PromotionCarousel Data Not insert in History Table",
//                     });
//             }
//             if (GetPromotionCarouselData.ImgFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.ImgFile;
//                 await fs.unlinkSync(imagePath);
//             }
//             if (GetPromotionCarouselData.VideoFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.VideoFile;
//                 await fs.unlinkSync(imagePath);
//             }
//             if (GetPromotionCarouselData.SubtitleFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionCarouselData.SubtitleFile;
//                 await fs.unlinkSync(imagePath);
//             }
//             const DeletePromotionCarouselData = await promotioncarousel.destroy({
//                 where: { PromotionID: PromotionID, PromotionCarouselID: ModuleID },
//             });
//             if (!DeletePromotionCarouselData) {
//                 return res
//                     .status(400)
//                     .send({
//                         ErrorCode: "REQUEST",
//                         message: "PromotionCarousel Data Not deleted",
//                     });
//             }
//         }
//         if (result.modulename == "promotionvideo") {
//             const GetPromotionvideoData = await promotionvideo.findOne({
//                 where: { PromotionID: PromotionID, PromotionVideoID: ModuleID },
//             });
//             if (!GetPromotionvideoData) {
//                 return res
//                     .status(400)
//                     .send({ ErrorCode: "REQUEST", message: "Promotionvideo Data not found" });
//             }
//             const CreatePromotionvideoHistoryData = await promotionvideohistory.create(
//                 GetPromotionvideoData.dataValues
//             );
//             if (!CreatePromotionvideoHistoryData) {
//                 return res
//                     .status(400)
//                     .send({
//                         ErrorCode: "REQUEST",
//                         message: "Promotion Data Not insert in History Table",
//                     });
//             }
//             if (GetPromotionvideoData.ImgFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionvideoData.ImgFile;
//                 await fs.unlinkSync(imagePath);
//             }
//             if (GetPromotionvideoData.VideoFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionvideoData.VideoFile;
//                 await fs.unlinkSync(imagePath);
//             }
//             if (GetPromotionvideoData.SubtitleFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionvideoData.SubtitleFile;
//                 await fs.unlinkSync(imagePath);
//             }

//             const DeletePromotionvideoData = await promotionvideo.destroy({
//                 where: { PromotionID: PromotionID, PromotionVideoID: ModuleID },
//             });
//             if (!DeletePromotionvideoData) {
//                 return res
//                     .status(400)
//                     .send({
//                         ErrorCode: "REQUEST",
//                         message: "Promotionvideo Data Not deleted",
//                     });
//             }
//         }
//         if (result.modulename == "promotiononboardingvideo") {
//             const GetPromotionOnBoardingVideoData = await promotiononboardingvideo.findOne({
//                 where: { PromotionID: PromotionID, PromotionOnboardingVideoID: ModuleID },
//             });
//             if (!GetPromotionOnBoardingVideoData) {
//                 return res
//                     .status(400)
//                     .send({ ErrorCode: "REQUEST", message: "PromotionOnBoardingVideo Data not found" });
//             }
//             const CreatePromotionOnBoardingVideoHistoryData = await promotiononboardingvideohistory.create(
//                 GetPromotionOnBoardingVideoData.dataValues
//             );
//             if (!CreatePromotionOnBoardingVideoHistoryData) {
//                 return res
//                     .status(400)
//                     .send({
//                         ErrorCode: "REQUEST",
//                         message: "Promotion Data Not insert in History Table",
//                     });
//             }

//             if (GetPromotionOnBoardingVideoData.ImgFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionOnBoardingVideoData.ImgFile;
//                 await fs.unlinkSync(imagePath);
//             }
//             if (GetPromotionOnBoardingVideoData.VideoFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionOnBoardingVideoData.VideoFile;
//                 await fs.unlinkSync(imagePath);
//             }
//             if (GetPromotionOnBoardingVideoData.SubtitleFile) {
//                 const parentDir = path.join(__dirname, '..');
//                 const imagePath = parentDir + "/upload/" + GetPromotionOnBoardingVideoData.SubtitleFile;
//                 await fs.unlinkSync(imagePath);
//             }
//             const DeletePromotionOnBoardingVideoData = await promotiononboardingvideo.destroy({
//                 where: { PromotionID: PromotionID, PromotionOnboardingVideoID: ModuleID },
//             });
//             if (!DeletePromotionOnBoardingVideoData) {
//                 return res
//                     .status(400)
//                     .send({
//                         ErrorCode: "REQUEST",
//                         message: "PromotionOnBoardingVideo Data Not deleted",
//                     });
//             }
//         }

//         res.status(201).json({ message: "Data Deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
// Upload Promotion File

async function uploadPromotionFiles(req, res, next) {
    try {
        if (req.files) {
            console.log(`------------<>-------------`);
            console.log(req.files);
            console.log(`------------<>-------------`);
            let moduleArray = [];
            let moduleVideoArray = [];
            let subtitleArray = [];
            if (req.files.ImgFile) {
                const imageFile = req.files.ImgFile;
                await Promise.all(imageFile.map(async (singleThumbFile) => {
                    let imageReqArray = await singleThumbFile.name.split("_");
                    const imgName = imageReqArray[0];
                    // const position = imageReqArray[imageReqArray.length - 1];
                    if (imgName === "PromotionCarouselThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionCarouselThumbnail');
                        req.Ct = singleThumbFile.name;
                        await singleThumbFile.mv(uploadDir + Date.now() + singleThumbFile.name);

                    }
                    if (imgName === "PromotionVideoThumbnail") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionVideoThumbnail');
                        req.CeT = singleThumbFile.name;
                        await singleThumbFile.mv(uploadDir + Date.now() + singleThumbFile.name);

                    }
                    if (imgName === "PromotionOnBoardingVideo") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionOnBoardingVideo');
                        req.Tt = singleThumbFile.name;
                        await singleThumbFile.mv(uploadDir + Date.now() + singleThumbFile.name);

                    }
                }));
            }
            if (req.files.VideoFile) {
                const videoFile = req.files.VideoFile;
                await Promise.all(videoFile.map(async (singleVideoFile) => {
                    let videoReqArray = await singleVideoFile.name.split("_");
                    const videoName = videoReqArray[0];
                    if (videoName === "PromotionCarouselVideo") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionCarouselVideo');
                        req.VCt = singleVideoFile.name;
                        await singleVideoFile.mv(uploadDir + Date.now() + singleVideoFile.name);

                    }
                    if (videoName === "PromotionVideoVideo") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionVideoVideo');
                        moduleVideoArray.push(singleVideoFile.name);
                        req.VMt = moduleVideoArray;
                        await singleVideoFile.mv(uploadDir + Date.now() + singleVideoFile.name);
                    }
                    if (videoName === "PromotionOnBoardingVideoVideo") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionOnBoardingVideoVideo');
                        moduleVideoArray.push(singleVideoFile.name);
                        req.VMt = moduleVideoArray;
                        await singleVideoFile.mv(uploadDir + Date.now() + singleVideoFile.name);
                    }
                }));
            }
            if (req.files.SubtitleFile) {
                const subtitleFile = req.files.SubtitleFile;
                await Promise.all(subtitleFile.map(async (singleSub) => {
                    let subReqArray = await singleSub.name.split("_");
                    const subName = subReqArray[0];
                    if (subName === "PromotionCarouselSubtitle") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionCarouselSubtitle');
                        subtitleArray.push(singleSub.name);
                        req.SMt = subtitleArray;
                        await singleSub.mv(uploadDir + Date.now() + singleSub.name);
                    }
                    if (subName === "PromotionVideoSubtitle") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionVideoSubtitle');
                        subtitleArray.push(singleSub.name);
                        req.SMt = subtitleArray;
                        await singleSub.mv(uploadDir + Date.now() + singleSub.name);
                    }
                    if (subName === "PromotionOnBoardingVideoSubtitle") {
                        const uploadDir = await path.join(__dirname, '..', 'upload', 'PromotionOnBoardingVideoSubtitle');
                        subtitleArray.push(singleSub.name);
                        req.SMt = subtitleArray;
                        await singleSub.mv(uploadDir + Date.now() + singleSub.name);
                    }
                }));
            }
            next();
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an error while uploading files"
        })
    }
}



module.exports = {
    AddRequest,
    // GetPromotionsRequest,
    // GetPromotionRequest,
    UpdateRequest,
    //upload_file
    // DeleteRequest,
    // DeleteModuleRequest,
    // uploadPromotionFiles,
};

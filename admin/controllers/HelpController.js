const { help, helphistory } = require("../models/index");
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const fs = require("fs");
const path = require("path");

const AddRequest = async (req, res) => {
    try {

        const { AccDetails } = req;
        const result = req.body;
        const createdHelpData = await help.create({
            Title: result.Title ?? undefined,
            AccountType: result.AccountType,
            Description: result.Description ?? undefined,
            Category: result.Category ?? undefined,
            ImgFile: result.ImgFile ?? undefined,
            VideoFile: result.VideoFile ?? undefined,
            SubtitleFile: result.SubtitleFile ?? undefined,
            IsActive: result.IsActive,
            CreatedBy: AccDetails.FirstName,
            LastModifiedBy: AccDetails.FirstName,
        });
        if (createdHelpData) {
            return res.status(200).json({
                Message: "Help information added successfully!"
            });
        }
    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};

const GetHelpsRequest = async (req, res) => {
    try {

        let { page, pageSize, Search } = req.query;
        page = page ? parseInt(page, 10) : 1;

        pageSize = pageSize ? parseInt(pageSize, 10) : 10;

        pageSize = pageSize <= 100 ? pageSize : 10;


        const whereCondition = {};
        whereCondition.IsActive = { [Op.in]: ["0", "1"] };

        if (Search) {
            whereCondition[Op.or] = [
                { AccountType: { [Op.like]: `%${Search}%` } },
                { Category: { [Op.eq]: Search } },
            ];
        }


        const { count, rows } = await help.findAndCountAll({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            where: whereCondition,
            IsActive: { $ne: "2" },
            order: [
                ['HelpID', 'ASC']
            ]
        });

        if (rows !== null) {
            return res.status(200).json({
                TotalCount: count,
                page: page,
                pageSize: pageSize,
                Data: rows
            });
        } else {
            return res.status(400).json({ Data: "Help Data Not Gets!" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }

};

const GetHelpRequest = async (req, res) => {
    try {
        const id = req.params.id;

        const whereCondition = {};
        whereCondition.HelpID = id;
        whereCondition.IsActive = { [Op.in]: ["0", "1"] };

        const GetHelpData = await help.findOne({ where: whereCondition });
        if (GetHelpData) {
            return res.status(200).json({
                TotalCount: GetHelpData.length,
                Data: GetHelpData
            });
        } else {
            return res.status(400).json({ Data: "Help Data Not Gets!" });
        }
    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};

const GetHelpCategoryRequest = async (req, res) => {
    try {
        const { accountType } = req.query;

        const whereCondition = {
            IsActive: { [Op.in]: ["0", "1"] },
        };

        if (accountType) {
            if (accountType === '2' || accountType === '3') {
                whereCondition.AccountType = accountType;
            } else {
                return res.status(400).json({ ErrorCode: "INVALID_INPUT", message: "Invalid account type. Please enter '2' or '3'." });
            }
        } else {
            whereCondition.AccountType = {
                [Op.or]: [
                    { [Op.eq]: '2' },
                    { [Op.eq]: '3' }
                ]
            };
        }


        const GetHelpData = await help.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('Category')), 'Category']],
            where: whereCondition,
        });

        if (GetHelpData && GetHelpData.length > 0) {
            return res.status(200).json({
                TotalCount: GetHelpData.length,
                Data: GetHelpData,
            });
        } else {
            return res.status(404).json({ Data: "Help Category Not Found!" });
        }

    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
};

const UpdateRequest = async (req, res) => {
    try {
        const id = req.params.id;
        const result = req.body;
        const { AccDetails } = req;
        if (result.filesname) {
            var deleteFile = JSON.parse(result.filesname);
            if (deleteFile) {
                var fileNames = await deleteFile.map(file => {
                    return file
                });
            }
        }
        // Find the existing help data to update
        let existingHelpData = await help.findOne({ where: { HelpID: id } });
        if (!existingHelpData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Help Data not found" });
        };

        const createdHistoryData = await helphistory.create(existingHelpData.dataValues);
        if (!createdHistoryData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Failed to create history entry" });
        }

        function deleteAndReplaceFile(existingFilePath, newFile) {
            if (fs.existsSync(existingFilePath)) {
                fs.unlink(existingFilePath, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`The file ${existingFilePath} was deleted successfully.`);
                    }
                });
            } else {
                console.log(`The file ${existingFilePath} does not exist. No action taken.`);
            }
        }


        if (existingHelpData.ImgFile) {
            const thumbDir = path.join(__dirname, '..', "Thumbnail");
            const imgFilePath = path.join(thumbDir, existingHelpData.ImgFile);
            if (result.ImgFile && result.ImgFile !== existingHelpData.ImgFile) {
                deleteAndReplaceFile(imgFilePath, result.ImgFile);
            }
        }

        if (existingHelpData.VideoFile) {
            const videoDir = path.join(__dirname, '..', "Video");
            const videoFilePath = path.join(videoDir, existingHelpData.VideoFile);
            if (result.VideoFile && result.VideoFile !== existingHelpData.VideoFile) {
                deleteAndReplaceFile(videoFilePath, result.VideoFile);
            }
        }

        if (existingHelpData.SubtitleFile) {
            const subtitleDir = path.join(__dirname, '..', "Subtitle");
            const subtitleFilePath = path.join(subtitleDir, existingHelpData.SubtitleFile);
            if (result.SubtitleFile && result.SubtitleFile !== existingHelpData.SubtitleFile) {
                deleteAndReplaceFile(subtitleFilePath, result.SubtitleFile);
            }
        }


        // if (fileNames) {
        //     const parentDir = path.join(__dirname, '..', "upload");
        //     const imagePath = parentDir;
        //     if (fileNames[0]) {
        //         await fs.unlinkSync(`${imagePath}/` + fileNames[0]);
        //     }
        //     if (fileNames[1]) {
        //         await fs.unlinkSync(`${imagePath}/` + fileNames[1]);
        //     }
        //     if (fileNames[2]) {
        //         await fs.unlinkSync(`${imagePath}/` + fileNames[2]);
        //     }
        // }

        if (fileNames) {
            const parentDir = path.join(__dirname, '..', "upload");
            const imagePath = parentDir;
            const fsSync = require('fs');

            for (const fileName of fileNames) {
                if (fileName) {
                    const filePath = `${imagePath}/${fileName}`;
                    if (fsSync.existsSync(filePath)) {  // Check if file exists
                        try {
                            await fs.unlink(filePath);
                        } catch (err) {
                            console.error(`Error deleting file ${filePath}:`, err);
                        }
                    } else {
                        console.warn(`File not found: ${filePath}`);
                    }
                }
            }
        }

        if (fileNames && fileNames.length > 0) {
            const updatedFileTypes = fileNames.map(async fileName => {
                const file = fileName.split('_');
                if (file[0] == "helpThumbnail") {
                    await existingHelpData.update({ ImgFile: null, HelpID: id }, { where: { HelpID: id } });
                }
                if (file[0] == "helpVideo") {
                    await existingHelpData.update({ VideoFile: null, HelpID: id }, { where: { HelpID: id } });
                }
                if (file[0] == "helpSubtitle") {
                    await existingHelpData.update({ SubtitleFile: null }, { where: { HelpID: id } });
                }
            });
        }
        if (result.ImgFile || result.VideoFile || result.SubtitleFile) {
            await existingHelpData.update({ ImgFile: result.ImgFile, VideoFile: result.VideoFile, SubtitleFile: result.SubtitleFile, where: { HelpID: id } })
        }

        // Update the existing help data 
        const updatedHelpData = await existingHelpData.update({
            Title: result.Title ?? existingHelpData.Title,
            AccountType: result.AccountType,
            Description: result.Description ?? existingHelpData.Description,
            Category: result.Category ?? existingHelpData.Category,
            IsActive: result.IsActive ?? existingHelpData.IsActive,
            LastModifiedBy: AccDetails.FirstName,
        }, { where: { HelpID: id } });

        if (updatedHelpData) {
            return res.status(200).json({
                Message: "Help information updated successfully!"
            });
        }

    }
    catch (error) {
        console.log(error);
        return res.status(400).send({ ErrorCode: "REQUEST 12121", message: error.message, Error: fileNames });
    }

};

const DeleteRequest = async (req, res) => {
    try {

        const id = req.params.id;
        const GetHelpData = await help.findOne({ where: { HelpID: id } });
        if (!GetHelpData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Help Data not found" });
        }

        const CreateHelpHistoryData = await helphistory.create(GetHelpData.dataValues);
        if (!CreateHelpHistoryData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Help Data Not inserted in History Table" });
        }

        const DeleteHelpData = await help.update(
            {
                IsActive: "2"
            },
            { where: { HelpID: id } }
        );


        res.status(200).json({
            message: "Help Data deleted successfully"
        })

        if (!DeleteHelpData) {
            return res.status(400).send({ ErrorCode: "REQUEST", message: "Help Data Not deleted" });
        }

        res.status(201).json({ message: "Data Deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// HTTP Requests

const GetHelpHttpRequest = async (req, res) => {
    try {
        const id = req.params.id;

        const whereCondition = {};
        whereCondition.HelpID = id;
        whereCondition.IsActive = { [Op.in]: ["0", "1"] };

        const GetHelpData = await help.findOne({ where: whereCondition });
        if (GetHelpData) {
            return res.status(200).json({
                TotalCount: GetHelpData.length,
                Data: GetHelpData
            });
        } else {
            return res.status(400).json({ Data: "Help Data Not Gets!" });
        }
    } catch (error) {
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
}

const GetHelpsHttpRequest = async (req, res) => {
    try {

        let { page, pageSize, Search } = req.query;
        page = page ? parseInt(page, 10) : 1;

        pageSize = pageSize ? parseInt(pageSize, 10) : 10;

        pageSize = pageSize <= 100 ? pageSize : 10;


        const whereCondition = {};
        if (Search) {
            whereCondition[Op.or] = [
                { AccountType: { [Op.like]: `%${Search}%` } },
                { Category: { [Op.like]: `%${Search}%` } },
            ];
        }

        whereCondition.IsActive = { [Op.in]: ["0", "1"] };

        const { count, rows } = await help.findAndCountAll({
            limit: pageSize,
            offset: (page - 1) * pageSize,
            where: whereCondition,
            order: [
                ['HelpID', 'ASC']
            ]
        });

        if (rows !== null) {
            return res.status(200).json({
                TotalCount: count,
                page: page,
                pageSize: pageSize,
                Data: rows
            });
        } else {
            return res.status(400).json({ Data: "Help Data Not Gets!" });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({ ErrorCode: "REQUEST", message: error.message, Error: error });
    }
}


module.exports = { AddRequest, GetHelpsRequest, GetHelpRequest, UpdateRequest, DeleteRequest, GetHelpCategoryRequest, GetHelpHttpRequest, GetHelpsHttpRequest };
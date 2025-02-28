const { createWorker } = require('tesseract.js');
const fs = require('fs');
const pdf = require('pdf-parse');
const WordExtractor = require("word-extractor");
const data = require('../Data/data');
const path = require('path');

//! Image OCR Starts here ------>>>>>>

async function getImageText(req, res, next) {
    try {
        // console.log(req);
        const worker = await createWorker("eng");

        if (!req.files) {
            return res.status(404).json({
                message: "No Files Detected"
            })
        }
        const fileValue = req.files.fileVal;
        if (!fileValue) {
            return res.status(404).json({
                message: "No Files Detected"
            })
        }
        let moveDir = path.join(__dirname , '..', '/Portfolios/');
        console.log(moveDir);
        await fileValue.mv(moveDir + fileValue.name);
        console.log(fileValue.mimetype);
        if (fileValue.mimetype === 'image/png' || fileValue.mimetype === 'image/jpg' || fileValue.mimetype === 'image/jpeg') {
            const { data } = await worker.recognize(moveDir + fileValue.name);
            if (data.text) {
                // console.log(data.text);
                req.TextImage = data.text;
                next();
            }
            else {
                res.status(404).json({
                    message: "Image donot contain textual content"
                })
            }
        }
        else if (fileValue.mimetype === 'application/pdf') {
            const pdfFile = fs.readFileSync(moveDir + fileValue.name);
            try {
                const pdfText = await pdf(pdfFile);
                if (pdfText.text) {
                    req.TextImage = pdfText.text;
                    next();
                }
            } catch (error) {
                console.log(error);
                res.status(500).json({
                    message: "Cannot Parse your pdf file"
                })
            }
        }
        else if (fileValue.mimetype === 'application/msword') {
            try {
                const extractor = new WordExtractor();
                const extracted = await extractor.extract(moveDir + fileValue.name);
                const textDoc = await extracted.getBody();
                if (textDoc) {
                    req.TextImage = textDoc;
                    next();
                }
                else {
                    console.log('object');
                }
            } catch (error) {
                console.log(error);
                res.status(500).json({
                    message: "There was an error while parsing word file"
                })
            }
        }
        else if (fileValue.mimetype === 'text/plain') {
            const contentBt = await fs.readFileSync(moveDir + fileValue.name);
            const textFile = await contentBt.toString();
            if (textFile) {
                req.TextImage = textFile;
                next();
            }
        }
        else {
            res.status(404).json({
                message: "Sorry! This file is not supported"
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

//! Image OCR Ends here ------>>>>>>

//! Score Calculations Starts here -------->>>>>>>>>>>

async function calculateScore(req, res) {
    try {
        const textConcept = req.TextImage;
        // // let score = 0;
        if (!textConcept) {
            res.status(404).json({
                message: "Image do not contain textual content"
            })
        }
        else {
            function giveScore(sysArr, feedArr) {
                let score = 0;
                // // console.log(feedArr);
                if (feedArr.length > 0) {
                    feedArr.forEach((singleWord) => {
                        // console.log(singleWord);
                        if (sysArr.includes(singleWord.trim().toLowerCase())) {
                            // // console.log(singleWord);
                            // // console.log("true");
                            score = score + 1;
                        }
                    })
                }
                return score;
            }
            const splittedText = await textConcept.split(" ");
            const scoreObtained = await giveScore(data, splittedText);
            res.status(200).json({
                message: "Your score is ready!",
                yourScore: scoreObtained
            })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Sorry! There was an server-side error"
        })
    }
}

//! Score Calculations Ends here -------->>>>>>>>>>>

module.exports = { getImageText, calculateScore };
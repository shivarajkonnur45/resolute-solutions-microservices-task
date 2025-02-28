const db = require("../models/index.js");
const Sequelize = require('sequelize');
const axios = require('axios');

// Initial static reports object
let reports = {
    "attendance": [
        {
            student: "Tommy Wellington",
            date: "25/06/2024",
            report: [
                {
                    course: "Cooking: Young Chef’s Journey",
                    Portfolio: "Create your own business",
                    loginDate: "16 August, 2024",
                    time: "3:35 PM",
                    Quiz: "Lesson 12",
                    lesson: "12"

                },
                {
                    course: "Cooking: Young Chef’s Journey",
                    Portfolio: "Create your own business",
                    loginDate: "16 August, 2024",
                    time: "3:35 PM",
                    Quiz: "Lesson 12",
                    lesson: "12"

                },
                {
                    course: "Cooking: Young Chef’s Journey",
                    Portfolio: "Create your own business",
                    loginDate: "16 August, 2024",
                    time: "3:35 PM",
                    Quiz: "Lesson 12",
                    lesson: "12"

                },
                {
                    course: "Cooking: Young Chef’s Journey",
                    Portfolio: "Create your own business",
                    loginDate: "16 August, 2024",
                    time: "3:35 PM",
                    Quiz: "Lesson 12",
                    lesson: "12"

                },
            ]
        }
    ],
    "transcript": [
        {
            student: "Tommy Wellington",
            date: "25/06/2024",
            report: [
                {
                    course: "Entrepreneurship: Young business owner’s journey",
                    Portfolio: "Create your own business",
                    loginDate: "16 August, 2024",
                    time: "3:35 PM",
                    Quiz: "Lesson 12",
                    lesson: "12"

                },
                {
                    course: "Entrepreneurship: Young business owner’s journey",
                    Portfolio: "Create your own business",
                    loginDate: "16 August, 2024",
                    time: "3:35 PM",
                    Quiz: "Lesson 12",
                    lesson: "12"

                },
                {
                    course: "Entrepreneurship: Young business owner’s journey",
                    Portfolio: "Create your own business",
                    loginDate: "16 August, 2024",
                    time: "3:35 PM",
                    Quiz: "Lesson 12",
                    lesson: "12"

                },
                {
                    course: "Entrepreneurship: Young business owner’s journey",
                    Portfolio: "Create your own business",
                    loginDate: "16 August, 2024",
                    time: "3:35 PM",
                    Quiz: "Lesson 12",
                    lesson: "12"

                },
            ]
        }
    ]
};

// API to get reports with filtering
const get_report = async (req, res) => {
    try {

        const { student, startDate, endDate, type } = req.query;

        if (!type || !reports[type]) {
            return res.status(400).send('Invalid report type');
        }

        const parseDate = (dateString) => {
            const [day, month, year] = dateString.split('/');
            return new Date(`${year}-${month}-${day}`);
        };

        const filteredReports = reports[type].filter(report => {
            const reportDate = parseDate(report.date);
            const isStudentMatch = !student || report.student === student;
            const isStartDateMatch = !startDate || reportDate >= new Date(startDate);
            const isEndDateMatch = !endDate || reportDate <= new Date(endDate);



            return isStudentMatch && isStartDateMatch && isEndDateMatch;
        });

        if (filteredReports.length > 0) {
            return res.json(filteredReports);
        } else {
            return res.status(404).send('Report not found');
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



module.exports = { get_report };



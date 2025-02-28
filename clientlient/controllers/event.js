const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cryptoJS = require("crypto-js");
const db = require("../models/index");
const Sequelize = require("sequelize");
const axios = require("axios");
// const { signUpSchema } = require('../eventer/validation');

// const get_event_list = async (req, res) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const filter = req.query.filter || '';
//         var url = process.env.HTTP_REQUEST_ADMIN + '/competition/competitions/?Search=' + filter + '&page=' + page + '&pageSize=' + limit;

//         const response = await axios.get(url, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`
//             }
//         });
//         res.status(200).json(response.data)
//     } catch (error) {
//         res.status(500).json({
//             message: "Sorry! there was server-side error",
//             error: error.message
//         })
//     }
// }
const get_event_list = async (req, res) => {
  try {
    const { AccDetails } = req;
    if (
      !AccDetails ||
      !AccDetails.UserID
    ) {
      return res.status(400).json({
        message: "Invalid! Token login again",
      });
    }
    if (!AccDetails.IsParticipateCompetitions || AccDetails.IsParticipateCompetitions == 0) {
      return res.status(200).json({
        message: "Event Data",
        eventData: [],
      });
    }

    const page = req.query.page ? req.query.page : 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const filters = {
      page: page,
      offset: offset,
    };
    if (!AccDetails) {
      return res.status(404).json({
        message: "Something went wrong! Login again",
      });
    } else {
      const adminUrl = process.env.HTTP_REQUEST_ADMIN;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;
      const userGrade = AccDetails.Grade; // Fetching and passing grade from token for grade filter
      const userId = AccDetails.UserID; // Fetching and passing user id from token for submitted competition filter

      const respEvent = await axios.get(
        `${adminUrl}/competition/competitions?studentGrade=${userGrade}&UserId=${userId}&filters=${JSON.stringify(filters)}`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      return res.status(200).json({
        message: "Event Data",
        eventData: respEvent.data.Data,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Sorry! There was an server-side error",
    });
  }
};

const get_event_detail = async (req, res) => {
  try {
    const response = await axios.get(
      process.env.HTTP_REQUEST_ADMIN +
        "/competition/competition/" +
        req.params.EventID,
      {
        headers: {
          Authorization: `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: "Sorry! there was server-side error",
      error: error.message,
    });
  }
};

const event_Submit_entry_htttp = async (req, res) => {
  try {
    const { AccDetails } = req;
    const eventData = req.body;

    const response = await axios.post(
      process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG + "/evnetSubmit/event_submit",
      { eventData, AccDetails },
      {
        headers: {
          Authorization: `Bearer ${process.env.HTTP_REQUEST_SECRET_KEY}`,
        },
      }
    );
    return res.status(200).json({
      message: "Event Submit successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

const get_submitted_events = async () => {
  try {
    const token = process.env.HTTP_REQUEST_SECRET_KEY;
    const response = await axios.get(
      process.env.HTTP_REQUEST_CLIENT_ACTVITY_LOG + "/evnetSubmit/get_event",
      {
        headers: { Authorization: "Bearer " + token },
      }
    );
    if (
      !response.data ||
      !Array.isArray(response.data["Submitted Competition IDs"])
    ) {
      console.error("Error: Invalid response format", response.data);
      return { error: "Invalid response format from submitted events API" };
    }
    if (response.data) {
      return response.data["Submitted Competition IDs"];
    }
    return response.data["Competition Not Submitted"];
  } catch (error) {
    console.error("Error in get_submitted_events:", error);
    return { error: "Error fetching submitted events: " + error.message };
  }
};

const get_submitted_list = async (req, res) => {
  try {
    const { AccDetails } = req;
    const page = req.query.page ? req.query.page : 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const filters = {
      page: page,
      limit: limit,
      offset: offset,
    };
    if (!AccDetails) {
      return res.status(404).json({
        message: "Something went wrong! Login again",
      });
    } else {
      const adminUrl = process.env.HTTP_REQUEST_ADMIN;
      const token = process.env.HTTP_REQUEST_SECRET_KEY;
      const userId = AccDetails.UserID;

      //Getting the submitted event data from admin
      const respSubmittted = await axios.get(
        `${adminUrl}/competition/submittedEvents?UserId=${userId}&filters=${filters}`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      if (respSubmittted.data.Data) {
        return res.status(200).json({
          submittedEvents: respSubmittted.data.Data,
        });
      } else {
        return res.status(200).json({
          submittedEvents: [],
        });
      }
    }
  } catch (error) {
    console.error("Error in get_submitted_list:", error);
    return res
      .status(500)
      .json({
        status: 500,
        message: "Sorry! there was a server-side error",
        error: error.message,
      });
  }
};

module.exports = {
  get_event_list,
  get_event_detail,
  event_Submit_entry_htttp,
  get_submitted_events,
  get_submitted_list,
};

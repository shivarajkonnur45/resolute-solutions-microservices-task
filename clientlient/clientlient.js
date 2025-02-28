require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const route = require("./routes/route");
const { createDefaultValues } = require("./controllers/emailStructure");
const { redisConnection } = require("./cache/subscription.js");
const fileValidity = require("./middleware/fileValidator.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://127.0.0.1:5000",
  })
);

app.use(express.static("uploads"));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);

require("./crons/cronJobs");

// ✅ FIXED: Directly use the route middleware
app.use("/api/v1", route);

app.use("/Portfolios", express.static("volume/portfolio"));
app.use("/certificate", fileValidity, express.static("volume/certificates"));
app.use("/.well-known", express.static(path.join(__dirname, ".well-known")));

// ✅ FIXED: Add Redis connection error handling
try {
  redisConnection();
  console.log("✅ Redis connected successfully");
} catch (err) {
  console.error("❌ Redis connection failed:", err);
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

createDefaultValues();

const toDisplay = {
  PORT: PORT,
  "API-For": "Client-Side",
  "Working-Status": true,
};

// ✅ FIXED: Redirect to an HTML page instead of sending JSON
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});


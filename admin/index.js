const express = require("express");
const app = express();
const cors = require("cors");
const route = require("./routes/route");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const apiLog = require("./middleware/apiLog");
const videoAuth = require("./middleware/videoRouteAuth");
const { redisConnection } = require("./cache/subscription.js");
const path = require("path"); // Add path module
require("dotenv").config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(fileUpload());
app.use(`/${process.env.VIDEO_ROUTE}`, videoAuth, express.static("volume/Video"));
app.use("/Thumbnail", express.static("volume/Thumbnail"));
app.use("/Subtitle", express.static("volume/Subtitle"));
app.use(apiLog);
app.use("/api/v1", route);
redisConnection();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`APP IS RUNNING AT ${PORT}`);
});

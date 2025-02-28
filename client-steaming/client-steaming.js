require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const route = require('./routes/route');
const path = require("path");

//const Upload = require('express-fileupload');


app.use(cors());
app.use(express.json());
// app.use(express.static("uploads"));
// app.use(Upload({
//     limits: { fileSize: 50 * 1024 * 1024 },
// }));

app.use('/api/v1', route);
// const receiveMessages = require('./sqs/sqsHandler');
// setInterval(receiveMessages, 5000);

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
})

//! Route Tester
const toDisplay = {
    "PORT" : PORT,
    "API-For" : "Streaming-Side",
    "Working-Status" : true
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
})


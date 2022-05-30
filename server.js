const express = require("express");
const app = express();
const cors = require("cors");
const http = require('http').Server(app);
require("dotenv").config({ path: "./config.env" });
const port = 8080;
const bodyParser = require("body-parser");

// get Database driver connection
const dbo = require("./db/conn");

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.json())
app.use(cors());

//API controllers

app.use(require('./routes/Auth'));


//perform a database connection when server starts

http.listen(port, () => {
  dbo.connectToServer(function (err) {
    if (err) console.error(err);
  });
  console.log(`Server is running on port: ${port}`);
});









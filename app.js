const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");

const bookings = require("./api/bookings");

const app = express();
app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use("/api", bookings());

module.exports = app;

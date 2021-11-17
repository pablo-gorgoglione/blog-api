const express = require("express");
const mongoose = require("mongoose");
var passport = require("passport");
const cors = require("cors");
require("dotenv").config();

var app = express();

/* DB */
var mongoDB = process.env.DB_STRING;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;

require("./models/AuthorModel");

/* Passport authentication */
// Pass the global passport object into the configuration function
require("./config/passport")(passport);

// This will initialize the passport object on every request
app.use(passport.initialize());

// request recongnition
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* CORS */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  })
);
app.options("*", cors());

/* Routes */
app.use(require("./routes"));
app.use("*", (req, res) => res.status(404).json({ error: "not found" }));

/* App */
app.listen(process.env.PORT);

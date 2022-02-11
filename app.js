const express = require('express');
// const mongoose = require('mongoose');
var passport = require('passport');
const cors = require('cors');
require('dotenv').config();
const { db } = require('./config/db');

/* -------------- BEGIN -------------- */
var app = express();

db();

require('./models/UserModel');

/* Passport authentication */
// Pass the global passport object into the configuration function
require('./config/passport')(passport);

// This will initialize the passport object on every request
app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.URL,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
  })
);

app.options('*', cors());

/* Routes */
app.use(require('./routes'));

app.use('*', (req, res) => res.status(404).json({ error: 'not found' }));

/* App */
const server = app.listen(process.env.PORT);

module.exports = { app, server };

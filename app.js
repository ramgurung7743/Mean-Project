require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
var passport = require('passport');

require('./app_api/models/db');
require('./app_api/config/passport');

// Initialize the express application
const app = express();

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use('/js', express.static(__dirname + '/node_modules/@uirouter/angularjs/release/'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'app_client')));
app.use(passport.initialize());

// Import routes
const indexRouter = require('./app_api/routes/index');

// Use routes
app.use(passport.initialize());
app.use('/api', indexRouter);

// view engine setup
app.set('views', path.join(__dirname, 'app_api', 'views'));
app.set('view engine', 'ejs');

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use((err, req, res, next) => {
  // Log the error internally
  logger.error(err); 
  // Add this line to print the full error
  console.error(err); 
  // Return a JSON response with the error
  res.status(err.status || 500).json({ error: err.message });
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Send the error as JSON
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message,
      error: err
    }
  });
});

module.exports = app;

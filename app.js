require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
var passport = require('passport');

require('./app_api/config/passport');

// Initialize the express application
const app = express();

// Connect to MongoDB
const encodedPassword = encodeURIComponent('Yonjan@2');
mongoose.connect(`mongodb://userRam:${encodedPassword}@localhost:27017/admin`)
.then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

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
const indexRouter = require('./api_app/routes/index');
const blogApiRoutes = require('./api_app/routes/blogApiRoutes');
const blogViewRoutes = require('./api_app/routes/blogViewRoutes');

// Use routes
app.use('/', indexRouter);
app.use('/api', blogApiRoutes);
app.use('/', blogViewRoutes);

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

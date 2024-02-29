var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var debug = require('debug')('app');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');

var app = express();

// Connect to MongoDB
mongoose.connect('mongodb://ram:Nepaligirl@localhost/blogDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Bootstrap and jQuery libraries
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/css', express.static(path.join(__dirname, '/public/stylesheets')));

// Routes
app.use('/', indexRouter);
const blogApiRoutes = require('./routes/blogApiRoutes'); // Adjust the path as necessary
const blogViewRoutes = require('./routes/blogViewRoutes'); // Adjust the path as necessary

const blogRouter = require('./controllers/blog'); // Adjust the path as necessary

app.use('/', blogRouter);
app.use('/api', blogApiRoutes);
app.use('/api', blogViewRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { 
        error: {
            status: err.status || 500,
            message: err.message,
            error: err
        }
    });
});

module.exports = app;

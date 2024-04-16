require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const debug = require('debug')('app');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

// Initialize the express application
const app = express();

// Method override middleware
app.use(methodOverride('_method'));

// Connect to MongoDB
const encodedPassword = encodeURIComponent('Yonjan@2');
mongoose.connect(`mongodb://userRam:${encodedPassword}@localhost:27017/admin`)
.then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB', err);
});

// Middleware setup
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'app_client')));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, 'app_client', 'index.html'));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const indexRouter = require('./routes/index');
const blogApiRoutes = require('./routes/blogApiRoutes'); 
const blogViewRoutes = require('./routes/blogViewRoutes');
const blogRouter = require('./controllers/blog');

// Use routes
app.use('/', indexRouter);
app.use('/', blogRouter);
app.use('/api', blogApiRoutes);
app.use('/', blogViewRoutes);

// Additional routes
app.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find(); // Fetch blogs to be displayed on the homepage
    res.render('home', { blogs: blogs });
  } catch (error) {
    console.error(error);
    res.send("Error loading home page");
  }
});

app.get('/blogList', async (req, res) => {
  try {
      const blogs = await Blog.find(); // Replace with your actual method to retrieve blogs
      res.render('blogList', { title: 'Blog List', blogs: blogs });
  } catch (error) {
      res.status(500).send(error.message);
  }
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

  // Render the error page
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

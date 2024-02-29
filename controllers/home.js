const express = require('express');
const app = express();
const port = 3000;

// Require blog.js controller
const blogRouter = require('./blog');

// Set up middleware
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.use(express.static('public')); // Set up static files directory if needed

// Middleware to parse request bodies - Add these lines
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Use the blog router for blog-related routes
app.use('/', blogRouter);

app.listen(port, () => console.log(`Blog app listening at http://localhost:${port}`));

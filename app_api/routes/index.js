require('dotenv').config();
const jwt = require('express-jwt');
const express = require('express');
const router = express.Router();
const User = require('../models/users');

const auth = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
});

// Example protected route
router.get('/protected', auth, function(req, res) {
  res.json({ message: 'This is a protected route' });
});

var ctrlBlog = require('../controllers/blogApiCtrl')
var ctrlAuth = require('../controllers/authentication');

// Define routes for blog operations
router.get('/blogs', ctrlBlog.blogList);
router.post('/blogs', auth, ctrlBlog.blogCreate);
router.get('/blogs/:blogid', ctrlBlog.blogReadOne);
router.put('/blogs/:blogid', auth, ctrlBlog.blogUpdateOne);
router.delete('/blogs/:blogid', auth, ctrlBlog.blogDeleteOne);

// Define routes for authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

module.exports = router;

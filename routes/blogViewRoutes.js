const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');

// Route to display the blog list page
router.get('/blogList', async (req, res, next) => {
  try {
    const blogs = await Blog.find();
    res.render('blogList', { title: 'Blog List', blogs: blogs });
  } catch (error) {
    next(error); // Delegate error handling
  }
});

module.exports = router;

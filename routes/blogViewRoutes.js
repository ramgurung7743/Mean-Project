const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
const moment = require('moment-timezone');

// Ensure this is the only GET /blogList handler in your application
router.get('/blogList', async (req, res) => {
  try {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      res.render('blogList', { blogs: blogs, moment: moment });
  } catch (error) {
      console.error('Failed to fetch blogs:', error);
      res.status(500).render('error', { error: 'Error fetching blog list' });
  }
});

// POST to add a new blog post
router.post('/blogAdd', async (req, res) => {
  try {
      const { blogTitle, blogText, author, authorEmail } = req.body;

      if (!blogTitle || !blogText || !author || !authorEmail) {
          res.status(400).render('error', { error: 'All fields are required' });
          return;
      }

      const newBlog = new Blog({
          blogTitle,
          blogText,
          author,
          authorEmail
      });
      await newBlog.save();
      res.redirect('/blogList'); // Redirect to the blog list after successful creation
  } catch (error) {
      console.error('Failed to add blog:', error);
      res.status(500).render('error', { error: 'Error adding blog' });
  }
});
module.exports = router;
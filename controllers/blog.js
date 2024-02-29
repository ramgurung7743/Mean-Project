const express = require('express');
const router = express.Router();
const Blog = require('../models/blog'); // Adjust the path to your Blog model

// Updated /list route to fetch blogs from the database
router.get('/list', async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.render('blogList', { title: 'Blog List', blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.render('error', { error }); // Assuming you have an error.ejs view
  }
});


// Keep the /add route as is to serve the form for adding a blog
router.get('/add', (req, res) => {
  res.render('blogAdd', { title: 'Add Blog' });
});

// Add here the route to handle POST request for adding a blog
// This assumes you have a form in blogAdd.ejs that sends a POST request to /add
router.post('/add', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) { // Basic validation
    return res.status(400).render('error', { error: { message: 'Title and content are required.' } });
  }

  try {
    const newBlog = new Blog({ title, content });
    await newBlog.save();
    res.redirect('/list');
  } catch (error) {
    console.error('Error adding blog:', error);
    res.status(500).render('error', { error });
  }
});


module.exports = router;
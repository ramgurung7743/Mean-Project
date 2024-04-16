const express = require('express');
const router = express.Router();
const Blog = require('../models/blog'); 

router.get('/blogList', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ modifiedDate: -1 }); 
    res.render('blogList', { blogs: blogs });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { error: error });
  }
});

router.get('/add', (req, res) => {
  res.render('blogAdd', { title: 'Add Blog' });
});

router.post('/add', async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
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
const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
const moment = require('moment-timezone');

// Home page route
router.get('/', (req, res) => {
    res.render('home', { title: 'Ram Gurung Blog Site' });
});

// Route to display all blogs
router.get('/blogList', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ updatedAt: -1 }); 
        
        res.render('blogList', { blogs: blogs, moment: moment });
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
        res.status(500).render('error', { error: 'Error fetching blog list' });
    }
});

// Blog Add page route (Form display)
router.get('/blogAdd', (req, res) => {
    res.render('blogAdd', { title: 'Add Blog' });
});

// Add a new blog post (Form submission)
router.post('/blogAdd', async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        res.status(400).render('error', { error: 'Title and content are required' });
        return;
    }

    try {
        const newBlog = new Blog({ title, content });
        await newBlog.save();
        res.redirect('/blogList');
    } catch (error) {
        console.error('Error adding new blog:', error);
        res.status(500).render('error', { error: 'Failed to add new blog' });
    }
});

// Route to get the edit blog page
router.get('/edit/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        res.render('blogEdit', { blog: blog, moment: moment });
    } catch (error) {
        console.error('Failed to fetch blog:', error);
        res.status(500).render('error', { error: 'Error fetching blog' });
    }
});

// Route to get the delete blog confirmation page
router.get('/delete/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }
        res.render('blogDelete', { blog: blog });
    } catch (error) {
        console.error('Failed to fetch blog:', error);
        res.status(500).render('error', { error: 'Error fetching blog' });
    }
});

// Route to handle the update blog post action
router.post('/update/:id', async (req, res) => {
    try {
        await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.redirect('/blogList');
    } catch (error) {
        console.error('Failed to update blog:', error);
        res.status(500).render('error', { error: 'Error updating blog' });
    }
});

// Route to handle the delete blog post action
router.delete('/delete/:id', async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/blogList');
    } catch (error) {
        console.error('Failed to delete blog:', error);
        res.status(500).render('error', { error: 'Error deleting blog' });
    }
});

module.exports = router;

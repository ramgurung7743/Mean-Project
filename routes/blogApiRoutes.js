const express = require('express');
const router = express.Router();
const Blog = require('../models/blog'); // Adjust the path to your Blog model if necessary

// Get all blog posts
router.get('/blogAdd', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single blog post by ID
router.get('/blogAdd/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new blog post
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

// Update a blog post
router.post('/blogAdd', async (req, res) => {
    const { title, content } = req.body; // Assuming these are the names of your form fields

    if (!title || !content) {
        res.status(400).render('error', { error: 'Title and content are required' });
        return;
    }

    try {
        const newBlog = new Blog({ title, content });
        await newBlog.save();
        res.redirect('/blogList'); // Redirect to the blog list after successful save
    } catch (error) {
        console.error('Error adding new blog:', error);
        res.status(500).render('error', { error: 'Failed to add new blog' });
    }
});


// Delete a blog post
router.delete('/blogAdd/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(204).send(); // Successfully deleted, no content to return
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
      
module.exports = router;
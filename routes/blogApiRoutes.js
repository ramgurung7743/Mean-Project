const express = require('express');
const router = express.Router();
const Blog = require('../models/blog'); // Adjust the path to your Blog model if necessary

// Get all blog posts
router.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single blog post by ID
router.get('/blogs/:id', async (req, res) => {
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
router.post('/blogs', async (req, res) => {
    const blog = new Blog({
        title: req.body.title,
        content: req.body.content
        // Include other fields as necessary
    });

    try {
        const newBlog = await blog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a blog post
router.put('/blogs/:id', async (req, res) => {
    const { title, content } = req.body;
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a blog post
router.delete('/blogs/:id', async (req, res) => {
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
const express = require('express');
const router = express.Router();



// Home page route
router.get('/', (req, res) => {
    res.render('home', { title: 'Ram Gurung Blog Site' });
});

// Blog List page route
router.get('/blogList', (req, res) => {
    res.render('blogList', { title: 'Blog List' });
});

// Blog Add page route
router.get('/blogAdd', (req, res) => {
    res.render('blogAdd', { title: 'Add Blog' });
});

module.exports = router;

require('dotenv').config();
const jwt = require('express-jwt');
const express = require('express');
const router = express.Router();
const User = require('../models/users'); // Ensure this path is correct

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

// Routes for comments
router.post('/blogs/:blogid/comments', auth, ctrlBlog.commentsCreate);
router.get('/blogs/:blogid/comments', ctrlBlog.commentsReadOne);
router.post('/blogs/:blogid/comments/:commentid/replies', auth, ctrlBlog.repliesCreate);

router.post('/blogs/:blogid/comments/:commentid/like', auth, ctrlBlog.likeComment);
router.post('/blogs/:blogid/comments/:commentid/dislike', auth, ctrlBlog.dislikeComment);

// Example for /api/register with better error handling
router.post('/api/register', async (req, res) => {
  try {
      console.log('User model:', User); // Debugging line to check if User is defined
      if (!req.body.email || !req.body.password) {
          return res.status(400).send('Email and password are required');
      }

      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
          return res.status(409).send('Email is already in use');
      }

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      const user = new User({ email: req.body.email, password: hash, name: req.body.name });
      const savedUser = await user.save();
      const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(201).send({ token });
  } catch (error) {
      console.error('Registration error:', error);
      res.status(500).send('An error occurred during registration');
  }
});

module.exports = router;
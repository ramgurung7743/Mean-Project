const mongoose = require('mongoose');
const moment = require('moment-timezone');

// Define the schema for a comment
const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Define the blog schema
var blogSchema = new mongoose.Schema({
  createdOn: { 
    type: Date, 
    default: Date.now
  },
  blogTitle: {
    type: String,
    required: true
  },
  blogText: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  authorEmail: {
    type: String,
    required: true
  },
  comments: [commentSchema]
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;

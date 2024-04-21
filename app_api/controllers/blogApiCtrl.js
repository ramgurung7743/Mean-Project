var mongoose = require("mongoose");
var Blog = mongoose.model("Blog");

//utility function for sending JSON response
var sendJSONresponse = function (res, status, content) {
    res.status(status);
    res.json(content);
};

// Create a blog
module.exports.blogCreate = async function (req, res) {
    console.log("Creating a blog");

    try {
        const newBlog = await Blog.create({
            blogTitle: req.body.blogTitle,
            blogText: req.body.blogText,
            createdOn: req.body.createdOn,
            author: req.body.author,
            authorEmail: req.body.authorEmail
        });
        sendJSONresponse(res, 201, newBlog);
    } catch (err) {
        console.log(err);
        sendJSONresponse(res, 400, err);
    }
};

// Read a blog
module.exports.blogReadOne = async function (req, res) {
    const blogId = req.params.blogid;
    console.log("Reading Blog:", blogId);

    try {
        const blog = await Blog.findOne({_id: blogId});
        console.log("API:", blog);

        if (blog) {
            sendJSONresponse(res, 200, blog);
        } else {
            sendJSONresponse(res, 404, { "Message": "Blog Not Found" });
        }
    } catch (err) {
        console.log(err);
        sendJSONresponse(res, 400, err);
    }
};

// Update a blog
module.exports.blogUpdateOne = async function (req, res) {
    const blogId = req.params.blogid;
    console.log('Updating Blog With ID:', blogId);

    const updates = {
        $set: {
            blogTitle: req.body.blogTitle,
            blogText: req.body.blogText
        }
    };

    try {
        const blog = await Blog.findByIdAndUpdate(blogId, updates, { new: true });
        if (!blog) {
            console.log(`No blog found with ID ${blogId}`);
            return sendJSONresponse(res, 404, { "message": "Blog not found" });
        }
        sendJSONresponse(res, 200, blog);
    } catch (err) {
        console.log('Error updating blog:', err);
        sendJSONresponse(res, 400, err);
    }
};

// DELETE /api/
module.exports.blogDeleteOne = async function (req, res) {
    const blogId = req.params.blogid;
    console.log("Deleting blog with id " + blogId);
    try {
        const blog = await Blog.findByIdAndDelete(blogId).exec();
        if (!blog) {
            console.log("Blog not found with id: " + blogId);
            sendJSONresponse(res, 404, { "message": "Blog not found" });
            return;
        }
        console.log("Blog Id " + blogId + " Deleted");
        sendJSONresponse(res, 204, null);
    } catch (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
    }
};

// Render blog list
const renderBlogList = function(req, res, responseBody) {
    const blogs = responseBody.map(blog => ({
        blogTitle: blog.blogTitle,
        blogText: blog.blogText,
        createdOn: blog.createdOn,
        author: blog.author,
        authorEmail: blog.authorEmail,
        _id: blog._id
    }));

    return blogs;
};

// GET /api/blogs
module.exports.blogList = async function (req, res) {
    console.log("Getting blogList");

    try {
        const blogs = await Blog.find().exec();

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ "Message": "Blogs Not Found" });
        }

        const formattedBlogs = renderBlogList(req, res, blogs);

        res.status(200).json(formattedBlogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ "Message": "Error Listing Blogs", error: err });
    }
};

// Post a comment
module.exports.commentsCreate = async function(req, res) {
    const blogId = req.params.blogid;
    console.log("Adding comment to Blog:", blogId);

    if (!req.payload._id) {
        res.status(401).json({ "Message": "UnauthorizedError: Private Profile" });
        return;
    }

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            sendJSONresponse(res, 404, { "Message": "Blog Not Found" });
            return;
        }
        blog.comments.push({
            commentText: req.body.commentText,
            author: req.payload.name,
            authorEmail: req.payload.email
        });

        // Using Promise-based save
        await blog.save();
        sendJSONresponse(res, 201, blog.comments[blog.comments.length - 1]);
    } catch (err) {
        sendJSONresponse(res, 400, err);
    }
};

// Get comments for a blog
module.exports.commentsReadOne = async function(req, res) {
    console.log('Getting comments from blog with ID:', req.params.blogid);

    try {
        const blog = await Blog.findById(req.params.blogid).select('comments');
        if (!blog) {
            sendJSONresponse(res, 404, { "Message": "Blog Not Found" });
            return;
        }
        sendJSONresponse(res, 200, blog.comments);
    } catch (err) {
        sendJSONresponse(res, 400, err);
    }
};

// Post a reply to a comment
module.exports.repliesCreate = async function(req, res) {
    try {
        const blog = await Blog.findById(req.params.blogid);
        if (!blog) {
            return res.status(404).send({message: "Blog Not Found"});
        }
        const comment = blog.comments.id(req.params.commentid);
        if (!comment) {
            return res.status(404).send({message: "Comment Not Found"});
        }
        comment.replies.push({
            commentText: req.body.commentText,
            author: req.body.author,
            authorEmail: req.body.authorEmail,
            createdOn: new Date()
        });
        await blog.save();
        res.status(201).json(comment.replies[comment.replies.length - 1]);
    } catch (err) {
        res.status(400).send(err);
    }
};

// Function to handle a like or dislike action
const handleReaction = async function (req, res, reactionType) {
    const blogId = req.params.blogid;
    const commentId = req.params.commentid;
    const userId = req.payload._id;

    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return sendJSONresponse(res, 404, { "Message": "Blog Not Found" });
        }

        const comment = blog.comments.id(commentId);
        if (!comment) {
            return sendJSONresponse(res, 404, { "Message": "Comment Not Found" });
        }
        const reactionIndex = comment.userReactions.findIndex(reaction => reaction.userId.equals(userId));

        // Reaction logic
        if (reactionIndex !== -1) {
            if (comment.userReactions[reactionIndex].reaction === reactionType) {
                comment.userReactions.splice(reactionIndex, 1);
                reactionType === 'like' ? comment.likes-- : comment.dislikes--;
            } else {
                comment.userReactions[reactionIndex].reaction = reactionType;
                if (reactionType === 'like') {
                    comment.likes++;
                    comment.dislikes--;
                } else {
                    comment.dislikes++;
                    comment.likes--;
                }
            }
        } else {
            // New reaction - add it
            comment.userReactions.push({ userId: userId, reaction: reactionType });
            reactionType === 'like' ? comment.likes++ : comment.dislikes++;
        }

        await blog.save();
        sendJSONresponse(res, 200, {
            likes: comment.likes,
            dislikes: comment.dislikes,
            userReactions: comment.userReactions
        });
    } catch (err) {
        sendJSONresponse(res, 400, err);
    }
};

module.exports.likeComment = function (req, res) {
    handleReaction(req, res, 'like');
};

module.exports.dislikeComment = function (req, res) {
    handleReaction(req, res, 'dislike');
};


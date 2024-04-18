// errorHandlers.js

/**
 * Function to display an error message.
 * @param {Object} req
 * @param {Object} res
 * @param {number} status
 * @param {string} title
 * @param {string} message 
 */
const showError = function(req, res, status, title, message) {
    res.status(status);
    res.render('error', {
        title: title,
        content: message
    });
};

module.exports = {
    showError
};

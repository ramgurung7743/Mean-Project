const express = require('express');
const app = express();
const port = 80;

const blogRouter = require('./blog');

// Set up middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', blogRouter);

app.listen(port, () => console.log(`Blog app listening at http://localhost:${port}`));
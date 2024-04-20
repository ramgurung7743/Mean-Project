var mongoose = require('mongoose')
require('dotenv').config();

//Database connection
var dbURI = process.env.DB_URL
mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 500000  // Extend the timeout to 50 seconds
});


// Monitor and report when database is connected                      
mongoose.connection.on('Connected', function () {
    console.log('Mongoose Connected To... ' + dbURI);
});
// Monitor and report error connecting to database
mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error: ' + err);
});

// Monitor and report when database is disconnected
mongoose.connection.on('Disconnected', function () {
    console.log('Mongoose Disconnected');
});
// Closes (disconnects) from Mongoose DB upon shutdown    
const gracefulShutdown = async (msg) => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose Disconnected Through ' + msg);
    } catch (err) {
        console.error('Mongoose Disconnection Error: ', err);
    }
};

// For nodemon restarts
process.once('SIGUSR2', async () => {
    await gracefulShutdown('nodemon restart');
    process.kill(process.pid, 'SIGUSR2');
});

// For app termination
process.on('SIGINT', async () => {
    await gracefulShutdown('app termination');
    process.exit(0);
});

// For Heroku app termination
process.on('SIGTERM', async () => {
    await gracefulShutdown('Heroku app shutdown');
    process.exit(0);
});


//Bring in schema and models
require('./blogs');
require('./users');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');


const app = express();


// DB config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(
        db, {
            useUnifiedTopology: true,
            useNewUrlParser: true
        }
    )
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Routs
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server listening on port ${PORT}!`));
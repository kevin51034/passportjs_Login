const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//User model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));


// Register Page
router.get('/register', (req, res) => res.render('register'));

// Register Handle
router.post('/register', (req, res) => {
    const {
        name,
        email,
        password,
        password2
    } = req.body;
    let errors = [];

    // check require fields
    if (!name || !email || !password || !password2) {
        errors.push({
            msg: 'Please enter all fields'
        });
    }
    // check same password
    if (password != password2) {
        errors.push({
            msg: 'Pleasing enter the same password'
        });
    }
    // check password length
    if (password.length < 6) {
        errors.push({
            msg: 'Password must be at least 6 characters'
        });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }
    // pass validation
    else {
        User.findOne({
                email: email
            })
            .then(user => {
                if (user) {
                    errors.push({
                        msg: 'Email is already registered'
                    });
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    console.log(newUser);

                    // Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if (err) throw err;

                            newUser.password = hash;

                            // save user
                            newUser.save()
                                .then(user => {
                                    console.log(newUser);
                                    res.redirect('/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            })
    }



})

module.exports = router;
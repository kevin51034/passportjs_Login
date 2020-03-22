const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {
    forwardAuthenticated,
    checkRole,
    ensureAuthenticated
} = require('../config/auth');

//User model
const User = require('../models/User');

// Login Page
//router.get('/login', (req, res) => res.render('login'));
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));


// Register Page
//router.get('/register', (req, res) => res.render('register'));
router.get('/register', ensureAuthenticated, checkRole, (req, res) => res.render('register'));

router.get('/security', ensureAuthenticated, (req, res) => res.render('security'));


// Register Handle
router.post('/register', (req, res) => {
    const {
        name,
        email,
        password,
        password2,
        role
    } = req.body;
    let errors = [];

    // check require fields
    if (!name || !email || !password || !password2 || !role) {
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
            password2,
            role
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
                        password,
                        role
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
                                    req.flash('success_msg', 'You are now registered');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            })
    }
})

// Change password Handle
router.post('/security', (req, res) => {
    const {
        email,
        oldPassword,
        newPassword,
        newPassword2,
    } = req.body;
    let errors = [];

    // check require fields
    if (!email || !oldPassword || !newPassword || !newPassword2) {
        errors.push({
            msg: 'Please enter all fields'
        });
    }
    // check same password
    if (newPassword != newPassword2) {
        errors.push({
            msg: 'Pleasing enter the same password'
        });
    }
    // check password length
    if (newPassword.length < 6) {
        errors.push({
            msg: 'Password must be at least 6 characters'
        });
    }

    if (errors.length > 0) {
        res.render('security', {
            email,
            oldPassword,
            newPassword,
            newPassword2,
        });
    }
    // pass validation
    else {
        User.findOne({
            email: email
        }, function (err, user) {
            if (err) throw err
            if (!user) {
                errors.push({
                    msg: 'Email is not registered'
                });
                res.render('security', {
                    email,
                    oldPassword,
                    newPassword,
                    newPassword2,
                });
            }

            // check passport
            bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    // Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newPassword, salt, (err, hash) => {
                            if (err) throw err;

                            user.password = hash;
                            // save user
                            user.save()
                                .then(user => {
                                    console.log(user);
                                    req.flash('success_msg', 'Password updateed!');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                } else {
                    console.log('Password incorrect')
                    errors.push({
                        msg: 'Password incorrect'
                    });
                    //req.flash('error_msg', 'Password incorrect');
                    res.render('security', {
                        email,
                        oldPassword,
                        newPassword,
                        newPassword2,
                    });
                }
            });
        });
    }
})

// Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true,
        //session: false
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;
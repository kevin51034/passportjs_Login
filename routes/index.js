const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated
} = require('../config/auth');

// Welcome page
router.get('/', (req, res) => res.render('welcome'));

// Dashbord
router.get('/dashboard', ensureAuthenticated, (req, res) => 
    res.render('dashboard', {
        user: req.user
    }));


module.exports = router;
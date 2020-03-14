module.exports = {
    ensureAuthenticated: function (req, res, next) {
        console.log('check authenticate')
        if (req.isAuthenticated()) {
            return next();
        }
        console.log('please log in');
        req.flash('error_msg', 'Please log in');
        res.redirect('/users/login');
    },
    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/dashboard');
    },
    checkRole: function (req, res, next) {
        console.log(req.user)
        if (req.user.role == 'admin') {
            console.log('admin')
            return next();
        }
        console.log('not admin')

        req.flash('error_msg', 'Please log in as admin');
        res.redirect('/dashboard');
    }
};
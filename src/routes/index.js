var express = require('express');
var router = express.Router();
var passport = require('passport');
/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Rent Portal-Home Page',
        errors: []
    });
});

router.post('/', function (req, res, next) {
    passport.authenticate('local',
        function (err, user, info) {
            if (err) {
                return next(err, info);
            }
            if (!user) {
                return res.render('index', {
                    title: 'Rent Portal-Login Page',
                    errMsg: 'User is not authorized'
                });
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.redirect('/expenses');
            });
        })(req, res, next);

});
module.exports = router;
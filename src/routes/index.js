var express = require('express');
var router = express.Router();
var passport = require('passport');
var persistRentalData = require('../middleware/persistRentalData');

function normalizedCtx(ctx) {
    var month = ctx.month || '';
    var tenantName = ctx.tenant || '';
    return {
        year: ctx.year.replace(':', ''),
        month: month.replace(':', ''),
        tenantName: tenantName.replace(':', '')
    };
}
/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Rent Portal-Home Page',
        errors: []
    });
});

router.get('/logout',
    function (req, res) {
        req.logout();
        res.redirect('/');
    });
router.get('/total/:year/:month/:tenant', function (req, res) {
    persistRentalData.getTenantMonthlySummary(normalizedCtx(req.params)).then(function (data) {
        return res.json(data);
    });
});

router.get('/all/total/:year/:month', function (req, res) {
    persistRentalData.getAllTenantsMonthlySummary(normalizedCtx(req.params)).then(function (data) {
        return res.json(data);
    });
});
router.get('/perperson/total/:year/:month', function (req, res) {
    persistRentalData.perPersonMonthlySummary(normalizedCtx(req.params)).then(function (data) {
        return res.json(data);
    });
});

router.get('/total/:year/:tenant', function (req, res) {
    persistRentalData.getTenantYearlySummary(normalizedCtx(req.params)).then(function (data) {
        return res.json(data);
    });
});

router.get('/util/total/:year', function (req, res) {
    persistRentalData.getUtilYearlySummary(normalizedCtx(req.params)).then(function (data) {
        return res.json(data);
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
                return res.redirect('profile/' + req.user.username);
            });
        })(req, res, next);

});
module.exports = router;
var express = require('express');
var router = express.Router();
var persistRentalData = require('../middleware/persistRentalData');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Rent Portal'
    });
});

router.get('/total/:year/:month/:tenant', function (req, res, next) {
    res.json(persistRentalData.getTenantMonthlySummary(normalizedCtx(req.params)));
});

router.get('/all/total/:year/:month', function (req, res, next) {
    res.json(persistRentalData.getAllTenantsMonthlySummary(normalizedCtx(req.params)));
});

router.get('/perperson/total/:year/:month', function (req, res, next) {
    res.json(persistRentalData.perPersonMonthlySummary(normalizedCtx(req.params)));
});

router.get('/total/:year/:tenant', function (req, res, next) {
    res.json(persistRentalData.getTenantYearlySummary(normalizedCtx(req.params)));
});

/* POST home page. */
router.post('/', function (req, res, next) {
    persistRentalData.saveData(req.body);
    res.render('index', {
        title: 'Rent Portal',
        message: 'Successfully logged the Data'
    });
});

function normalizedCtx(ctx) {
    var month = ctx.month || '';
    var tenantName = ctx.tenant || '';
    return {
        year: ctx.year.replace(':', ''),
        month: month.replace(':', ''),
        tenantName: tenantName.replace(':', '')
    }
}

module.exports = router;
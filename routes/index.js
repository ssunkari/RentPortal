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
    res.json(persistRentalData.getTentantData(normalizedCtx(req.params)));
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
    return {
        year: ctx.year.replace(':', ''),
        month: ctx.month.replace(':', ''),
        tenantName: ctx.tenant.replace(':', '')
    }
}

module.exports = router;
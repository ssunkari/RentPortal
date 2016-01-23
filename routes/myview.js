var express = require('express');
var router = express.Router();
var fileHelper = require('../middleware/fileHelper');
var moment = require('moment');
var persistRentalData = require('../middleware/persistRentalData');

router.get('/', function (req, res, next) {
    var date = new moment();
    console.dir(req.body);
    var currentMonthSummary = persistRentalData.getTenantMonthlySummary({
        tenantName: req.body.tenant_name,
        year: date.format('YYYY'),
        month: date.format('MM')
    });
    console.dir(currentMonthSummary);

    res.render('myview', {
        title: 'My View',
        tenantName: req.body.tenant_name,
        currentMonthSummary: currentMonthSummary,
        highcharts: Highcharts
    });
});

module.exports = router;
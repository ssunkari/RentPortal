var express = require('express');
var router = express.Router();
var moment = require('moment');
var persistRentalData = require('../middleware/persistRentalData');

router.post('/', function (req, res) {
    var date = moment();
    persistRentalData.getTenantMonthlySummary({
        tenantName: req.body.tenant_name,
        year: date.format('YYYY'),
        month: date.format('MM')
    }).then(function (monthlySummary) {
        console.dir(monthlySummary);

        res.render('myview', {
            title: 'My View',
            tenantName: req.body.tenant_name,
            currentMonthSummary: monthlySummary
        });
    });

});

module.exports = router;
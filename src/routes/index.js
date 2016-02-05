var express = require('express');
var router = express.Router();
var persistRentalData = require('../middleware/persistRentalData');
var errors = [];
/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: 'Rent Portal',
        errors: []
    });
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

function validate(formFields) {
    if (!formFields.tenants) {
        errors.push('Select tenant from the drop down list');
    }
    if (!formFields.selectedDay) {
        errors.push('Date Selection is mandatory');
    }
    if (!(formFields.gas || formFields.electricity || formFields.household)) {
        errors.push('Please select atleast a utility');
    }
    console.log(parseFloat(formFields.gas));
    if (formFields.gas && !parseFloat(formFields.gas)) {
        errors.push('Invalid amount is entered in gas field');
    }
    if (formFields.electricity && !parseFloat(formFields.electricity)) {
        errors.push('Invalid amount is entered in electricity field');
    }
    if (formFields.household && !parseFloat(formFields.household)) {
        errors.push('Invalid amount is entered in household field');
    }
    return errors;
}

/* POST home page. */
router.post('/', function (req, res) {
    errors.clear();
    validate(req.body);
    if (errors.length) {
        res.render('index', {
            title: 'Rent Portal',
            errors: errors
        });
    } else {
        //  var errors = req.validationErrors();

        persistRentalData.saveData(req.body).then(function () {
            res.render('index', {
                title: 'Rent Portal',
                message: 'Successfully logged the Data',
                errors: errors
            });
        });
    }
});

function normalizedCtx(ctx) {
    var month = ctx.month || '';
    var tenantName = ctx.tenant || '';
    return {
        year: ctx.year.replace(':', ''),
        month: month.replace(':', ''),
        tenantName: tenantName.replace(':', '')
    };
}

module.exports = router;
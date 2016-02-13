var express = require('express');
var router = express.Router();
var errors = [];
var persistRentalData = require('../middleware/persistRentalData');

/* GET home page. */
router.get('/',
    //   require('connect-ensure-login').ensureLoggedIn('/'),
    function (req, res) {

        res.render('expenses', {
            title: 'Expenses Portal',
            errors: [],
            user: req.query.user
        });
    });

/* POST expenses. */
router.post('/', function (req, res) {
    errors.clear();
    validate(req.body);
    if (errors.length) {
        res.render('expenses', {
            user: req.query.user,
            title: 'Rent Portal',
            errors: errors
        });
    } else {
        req.body.tenants = req.query.user;
        var input = cannonicalInput(req.body, req.query.user);
        persistRentalData.saveData(input).then(function () {
            res.render('expenses', {
                user: req.query.user,
                title: 'Expenses Portal',
                message: 'Successfully logged the Data',
                errors: errors
            });
        });
    }
});

function cannonicalInput(form, tenantName) {
    var input = {
        selectedDay: form.selectedDay,
        tenants: tenantName

    };
    switch (form.utilType) {
    case 'gas':
        input.gas = form.amount;
        break;
    case 'electricity':
        input.electricity = form.amount;
        break;
    case 'household':
        input.household = form.amount;
        break;
    case undefined:
        throw new Error('undefined Util Type');
    }
    return input;
}

function validate(formFields) {
    if (formFields.amount && !parseFloat(formFields.amount)) {
        errors.push('Invalid amount is entered');
    }
    return errors;
}

module.exports = router;
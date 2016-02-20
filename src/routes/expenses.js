var express = require('express');
var router = express.Router();
var moment = require('moment');
var errors = [];
var persistRentalData = require('../middleware/persistRentalData');
var houseshares = require('../middleware/houseshares');

/* GET Expenses*/
router.get('/',
    //   require('connect-ensure-login').ensureLoggedIn('/'),
    function (req, res) {

        res.render('expenses', {
            title: 'Submit Expenses',
            errors: [],
            user: req.query.user
        });
    });

router.get('/data/houseshares',
    //   require('connect-ensure-login').ensureLoggedIn('/'),
    function (req, res) {
        houseshares.getByDates(req.query.user, {
            startDate: req.query.startDate,
            endDate: req.query.endDate
        }).then(function (result) {
            return res.json(result);
        });
    });

function viewHouseShares(startDate, endDate, user) {
    return houseshares.getByDates(user, {
        startDate: startDate || moment().startOf('month').format('YYYY-MM-DD'),
        endDate: endDate || moment().endOf('month').format('YYYY-MM-DD')
    });
}

router.get('/houseshares',
    //   require('connect-ensure-login').ensureLoggedIn('/'),
    function (req, res) {
        viewHouseShares(req.query.startDate, req.query.endDate, req.query.user).then(function (result) {
            res.render('houseshares', {
                user: req.query.user,
                title: 'Rent Portal',
                result: result
            });
        });
    });

router.delete('/delete',
    //   require('connect-ensure-login').ensureLoggedIn('/'),
    function (req, res) {
        persistRentalData.removeExpense(req.query.user, req.query.purchaseDate, req.query.utilType).then(function (err) {
            if (err) {
                res.send(err, 500);
            } else {
                res.send('Successfully Deleted');
            }
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
var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var moment = require('moment');
var _ = require('lodash');
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

router.get('/breakdown',
    //   require('connect-ensure-login').ensureLoggedIn('/'),
    function (req, res) {
        var houseConfig = persistRentalData.getHouseConfig();
        var ctx = {
            year: moment().format('YYYY'),
            month: moment().format('MM'),
            tenantName: req.query.user
        };
        var tenantMonthlyUtilSummary = persistRentalData.getTenantMonthlySummary(ctx);
        var perPersonUtilSummary = persistRentalData.perPersonMonthlySummary(ctx);

        Promise.all([houseConfig, tenantMonthlyUtilSummary, perPersonUtilSummary]).then(function (values) {

            var result = {

                data: [{
                    costType: 'Fixed Rent',
                    totalSpent: parseFloat(values[0].total_rent),
                    noOfTenants: values[0].num_of_tenants,

                    yourShare: parseFloat(values[0].total_rent / values[0].num_of_tenants),
                    yourContribution: 0,
                    youOwe: parseFloat(values[0].total_rent / values[0].num_of_tenants),
                    formula: '(Fixed Rent / Number Of Tenants)'

                }, {
                    costType: 'Gas',
                    totalSpent: parseFloat(values[2].util.gas),
                    noOfTenants: values[0].num_of_tenants,

                    yourShare: parseFloat(values[2].util.gas / values[0].num_of_tenants),
                    yourContribution: parseFloat(values[1].util.gas),
                    youOwe: parseFloat((values[2].util.gas / values[0].num_of_tenants) - (values[1].util.gas)),
                    formula: '(Amount Spent On Gas / Number Of Tenants) - Your Contribution'
                }, {
                    costType: 'Electricity',
                    totalSpent: parseFloat(values[2].util.electricity),
                    noOfTenants: values[0].num_of_tenants,

                    yourShare: parseFloat(values[2].util.electricity / values[0].num_of_tenants),
                    yourContribution: parseFloat(values[1].util.electricity),
                    youOwe: parseFloat((values[2].util.electricity / values[0].num_of_tenants) - (values[1].util.electricity)),
                    formula: '(Amount Spent On Electricity / Number Of Tenants) - Your Contribution'
                }, {
                    costType: 'Household',
                    totalSpent: values[2].util.household,
                    noOfTenants: values[0].num_of_tenants,

                    yourShare: values[2].util.household / values[0].num_of_tenants,
                    yourContribution: values[1].util.household,
                    youOwe: (values[2].util.household / values[0].num_of_tenants) - (values[1].util.household),
                    formula: '(Amount Spent On Household / Number Of Tenants) - Your Contribution'
                }]
            };
            result.totals = {
                totalSpent: _.sum(result.data, function (cost) {
                    return cost.totalSpent;
                }),
                yourTotalShare: _.sum(result.data, function (cost) {
                    return cost.yourShare;
                }),
                yourTotalContribution: _.sum(result.data, function (cost) {
                    return cost.yourContribution;
                }),
                youOweTotal: values[1].total

            };
            console.dir(result);

            res.render('breakdown', {
                user: req.query.user,
                title: 'Rent Portal',
                result: result
            });
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
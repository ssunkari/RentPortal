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

            var houseRentConfig = values[0];
            var tenantMonthlyUtilSummary = values[1];
            var perPersonUtilSummary = values[2];
            var rentPerPerson = parseFloat(houseRentConfig.total_rent / houseRentConfig.num_of_tenants);
            var result = {

                data: [{
                    costType: 'Fixed Rent',
                    totalSpent: parseFloat(houseRentConfig.total_rent).toFixed(2),
                    noOfTenants: houseRentConfig.num_of_tenants,
                    yourShare: rentPerPerson,
                    yourContribution: 0,
                    youOwe: rentPerPerson,
                    formula: '(Fixed Rent / Number Of Tenants)'

                }, {
                    costType: 'Gas',
                    totalSpent: parseFloat(perPersonUtilSummary.util.gas).toFixed(2),
                    noOfTenants: houseRentConfig.num_of_tenants,
                    yourShare: (parseFloat(perPersonUtilSummary.util.gas) / houseRentConfig.num_of_tenants).toFixed(2),
                    yourContribution: parseFloat(tenantMonthlyUtilSummary.util.gas).toFixed(2),
                    youOwe: (parseFloat(perPersonUtilSummary.util.gas) / parseInt(houseRentConfig.num_of_tenants)) - parseFloat(tenantMonthlyUtilSummary.util.gas),
                    formula: '(Amount Spent On Gas / Number Of Tenants) - Your Contribution'
                }, {

                    costType: 'Electricity',
                    totalSpent: parseFloat(perPersonUtilSummary.util.electricity),
                    noOfTenants: houseRentConfig.num_of_tenants,
                    yourShare: parseFloat(perPersonUtilSummary.util.electricity) / parseInt(houseRentConfig.num_of_tenants),
                    yourContribution: parseFloat(tenantMonthlyUtilSummary.util.electricity),
                    youOwe: (parseFloat(perPersonUtilSummary.util.electricity) / parseInt(houseRentConfig.num_of_tenants)) - parseFloat(tenantMonthlyUtilSummary.util.electricity),
                    formula: '(Amount Spent On Electricity / Number Of Tenants) - Your Contribution'
                }, {
                    costType: 'Household',
                    totalSpent: parseFloat(perPersonUtilSummary.util.household),
                    noOfTenants: houseRentConfig.num_of_tenants,

                    yourShare: parseFloat(perPersonUtilSummary.util.household) / parseInt(houseRentConfig.num_of_tenants),
                    yourContribution: parseFloat(tenantMonthlyUtilSummary.util.household),
                    youOwe: (parseFloat(perPersonUtilSummary.util.household) / parseInt(houseRentConfig.num_of_tenants)) - parseFloat(tenantMonthlyUtilSummary.util.household),
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
                youOweTotal: tenantMonthlyUtilSummary.total
            };

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
        tenants: tenantName,
        costName: form.costName
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
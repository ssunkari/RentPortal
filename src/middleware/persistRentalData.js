var moment = require('moment');
var _ = require('lodash');
var redisClient = require('../redisClient');
var redisStore = require('./redis/redisStore');
var Promise = require('bluebird');

function save(key, value) {
    return Promise.resolve(redisClient.set(key, value));
}

function removeExpense(user, purchaseDate, utilType) {
    var key = buildKey({
        selectedDay: purchaseDate,
        tenants: user
    });
    console.log('Remove Expenses: Key ::', key);
    console.log('Remove Expenses: UtilType ::', utilType);

    return redisStore.delHashKeyValue(key, [utilType]).then(function (res) {
        console.log('Redis has key deleted succeeded :', res);
    });
}

function buildKey(formData) {
    var selectedDate = moment(formData.selectedDay, 'YYYYMMDD');
    var month = selectedDate.format('MM');
    var year = selectedDate.format('YYYY');
    var day = selectedDate.format('DD');
    var key = year + '::' + month + '::' + day + '::' + formData.tenants;
    console.log('Key to store', key);
    return key;
}

function saveData(formData) {
    console.log('Started to Save to Redis Db');
    var key = buildKey(formData);
    console.log('Key to store', key);
    console.log('FormData to store', formData);
    return redisStore.save(key, Object.mapObjectToArray(formData));
}

function getTenantMonthlySummary(ctx) {
    var key = ctx.year + '::' + ctx.month + '::*::' + ctx.tenantName;
    var response = {
        tenantName: ctx.tenantName,
        year: ctx.year,
        month: ctx.month
    };

    var getTenantSummary = getMonthlyTenantSummary(key, ctx);

    return getTenantSummary.then(function (tenantSummary) {
        response.total = parseFloat(tenantSummary.total).toFixed(2);
        response.runningTotal = tenantSummary.runningTotal;
        response.util = {
            gas: tenantSummary.gas,
            electricity: tenantSummary.electricity,
            household: tenantSummary.household
        };

        return response;
    });
}

function getAllTenantsMonthlySummary(ctx) {
    var listOfTenants = ['Srinu', 'George', 'Sam', 'Vikram', 'Rasmus'];
    return Promise.all(listOfTenants.map(function (tenant) {
        ctx.tenantName = tenant;
        return getTenantMonthlySummary(ctx);
    }));

}

function getHouseConfig() {
    return redisStore
        .getByKey('35::stanley');
}

function getUtilYearlySummary(ctx) {
    var monthsInYear = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var responses = monthsInYear.map(function (month) {
        var key = ctx.year + '::' + month + '*';
        return getMonthlyTenantSummary(key, ctx);
    });

    return Promise.all(responses).then(function (monthlySummary) {
        return [{
                name: 'gas',
                data: monthlySummary.map(function (monthly) {
                    return monthly.gas;
                })
            }, {
                name: 'electricity',
                data: monthlySummary.map(function (monthly) {
                    return monthly.electricity;
                })
            }, {
                name: 'household',

                data: monthlySummary.map(function (monthly) {
                    return monthly.household;
                })
            }, {
                name: 'combined',
                data: monthlySummary.map(function (monthly) {
                    return monthly.runningTotal;
                })
            }

        ];

    });
}

function getTenantYearlySummary(ctx) {

    var monthsInYear = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var responses = monthsInYear.map(function (month) {
        ctx.month = month;
        return perPersonMonthlySummary(ctx);
    });

    return Promise.all(responses).then(function (items) {
        return items.map(function (monthly) {
            return monthly.total;
        });

    }).then(function (monthlySummary) {
        return [{
            name: ctx.tenantName,
            data: monthlySummary
        }];

    });
}

function getMonthlyTenantSummary(key, ctx) {
    var getUtilitySummaryForTenant = redisStore.getByWildcardKey(key)
        .then(function (values) {
            return Promise.all(values.map(function (keyValue) {
                return keyValue.value;

            }));
        })
        .then(function (keyValueArray) {
            var gas = _.sum(keyValueArray, function (tenant) {
                return tenant.gas;
            });
            var electricity = _.sum(keyValueArray, function (tenant) {
                return tenant.electricity;
            });
            var household = _.sum(keyValueArray, function (tenant) {
                return tenant.household;
            });
            console.log('gas :', gas, 'electricity :', electricity, 'household', household);
            var runningTotal = gas + electricity + household;

            return {
                gas: gas,
                electricity: electricity,
                household: household,
                runningTotal: runningTotal
            };
        });

    return Promise.all([perPersonMonthlySummary(ctx), getUtilitySummaryForTenant])
        .then(function (values) {
            console.log('per person monthly summary');
            var utils = values[1];
            var total = parseFloat(values[0].total - utils.runningTotal).toFixed(2);
            return {
                total: total,
                runningTotal: utils.gas + utils.electricity + utils.household,
                gas: utils.gas,
                electricity: utils.electricity,
                household: utils.household
            };
        });
}

function perPersonMonthlySummary(ctx) {
    var key = ctx.year + '::' + ctx.month + '::*';
    var monthlySummary = redisStore.getByWildcardKey(key)
        .then(function (values) {
            return Promise.all(values.map(function (keyValue) {
                return keyValue.value;
            }));
        })
        .then(function (tenantDocs) {
            return tenantDocs.map(function (item) {
                return {
                    gas: item.gas,
                    electricity: item.electricity,
                    household: item.household
                };
            });
        })

    .then(function (tenantsUtilArray) {

        var totalUtilityExpensesForMonthForAlltenants = _.sum(tenantsUtilArray, function (util) {
            return util.gas || 0 + util.electricity || 0 + util.household || 0;
        });
        var gas = _.sum(tenantsUtilArray, function (util) {
            return util.gas || 0;
        });
        var electricity = _.sum(tenantsUtilArray, function (util) {
            return util.electricity || 0;
        });
        var household = _.sum(tenantsUtilArray, function (util) {
            return util.household || 0;
        });
        var response = {
            year: ctx.year,
            month: ctx.month
        };
        response.total = totalUtilityExpensesForMonthForAlltenants;
        response.util = {
            gas: gas,
            electricity: electricity,
            household: household
        };

        return response;
    });
    return Promise.all([monthlySummary, getHouseConfig()]).then(function (values) {
        values[0].total = parseFloat(values[0].total + parseFloat(values[1].total_rent)) / parseInt(values[1].num_of_tenants).toFixed(2);
        return values[0];
    });
}

module.exports = {
    saveData: saveData,
    getTenantMonthlySummary: getTenantMonthlySummary,
    getTenantYearlySummary: getTenantYearlySummary,
    getAllTenantsMonthlySummary: getAllTenantsMonthlySummary,
    perPersonMonthlySummary: perPersonMonthlySummary,
    getUtilYearlySummary: getUtilYearlySummary,
    save: save,
    removeExpense: removeExpense,
    getHouseConfig: getHouseConfig
};
var moment = require('moment');
var _ = require('lodash');
var redisClient = require('../redisClient');
var redisStore = require('./redis/redisStore');
var promise = require('bluebird');
var Promise = require('bluebird');

function save(key, value) {
    return promise.resolve(redisClient.set(key, value));
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
    console.log('Get Tenant Request Key : ', key);
    var response = {
        tenantName: ctx.tenantName,
        year: ctx.year,
        month: ctx.month
    };

    var getTenantSummary = getTenantSummaryFromMonthlyDataFile(key, ctx);

    return getTenantSummary.then(function (tenantSummary) {
        response.total = tenantSummary.total;
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
    var listOfTenants = ['Srinu', 'George', 'Sam', 'Vikram'];
    return promise.all(listOfTenants.map(function (tenant) {
        ctx.tenantName = tenant;
        return getTenantMonthlySummary(ctx);
    }));

}

function getFixedMonthlyHouseRentPerTenant() {
    return redisStore
        .getByKey('35::stanley').then(function (houseConfig) {
            return houseConfig.total_rent / houseConfig.num_of_tenants;
        });
}

function getTenantYearlySummary(ctx) {
    var totals = {
        tenantName: ctx.tenantName,
        year: ctx.year,
        total: 0,
        runningTotal: 0,
        util: {
            gas: 0,
            electricity: 0,
            household: 0
        }
    };

    var monthsInYear = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var responses = monthsInYear.map(function (month) {
        var key = ctx.year + '::' + month + '::*::' + ctx.tenantName;
        return getTenantSummaryFromMonthlyDataFile(key, ctx);
    });

    return promise.all(responses).then(function (items) {
        return items.reduce(function addToTotals(totals, monthly) {
            console.log('Promises Loop');
            console.objectLog(monthly);
            totals.total += monthly.total;
            totals.runningTotal += monthly.runningTotal;
            totals.util.gas += monthly.gas;
            totals.util.electricity += monthly.electricity;
            totals.util.household += monthly.household;
            return totals;
        }, totals);

    });
}

function getTenantSummaryFromMonthlyDataFile(key, ctx) {
    console.log('getTenantSummaryFromMonthlyDataFile');
    var getUtilitySummaryForTenant = redisStore.getByWildcardKey(key)
        .then(function (values) {
            console.log('Raw Data From Store ================');
            return Promise.all(values.map(function (keyValue) {
                return keyValue.value;

            }));
        })
        .then(function (keyValueArray) {
            console.objectLog(keyValueArray);
            var gas = _.sum(keyValueArray, function (tenant) {
                return tenant.gas;
            });
            var electricity = _.sum(keyValueArray, function (tenant) {
                return tenant.electricity;
            });
            var household = _.sum(keyValueArray, function (tenant) {
                return tenant.household;
            });
            var runningTotal = gas + electricity + household;

            return {
                gas: gas,
                electricity: electricity,
                household: household,
                runningTotal: runningTotal
            };
        });

    return promise.all([perPersonMonthlySummary(ctx), getUtilitySummaryForTenant])
        .then(function (values) {
            console.log('per person monthly summary');
            console.objectLog(values);
            var utils = values[1];
            var total = values[0].total - utils.runningTotal;
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
        .then(function (flattenedArray) {
            return flattenedArray.map(function (item) {
                return {
                    gas: item.gas,
                    electricity: item.electricity,
                    household: item.household
                };
            });
        })

    .then(function (utilArray) {

        var totalUtilityExpensesForMonthForAlltenants = _.sum(utilArray, function (util) {
            return util.gas + util.electricity + util.household;
        });
        var gas = _.sum(utilArray, function (util) {
            return util.gas;
        });
        var electricity = _.sum(utilArray, function (util) {
            return util.electricity;
        });
        var household = _.sum(utilArray, function (util) {
            return util.household;
        });
        var response = {
            year: ctx.year,
            month: ctx.month
        };

        response.total = totalUtilityExpensesForMonthForAlltenants / 4;
        response.util = {
            gas: gas,
            electricity: electricity,
            household: household
        };

        return response;
    });
    var fixedHouseRentPerTenant = getFixedMonthlyHouseRentPerTenant();
    return promise.all([monthlySummary, fixedHouseRentPerTenant]).then(function (values) {

        values[0].total = values[0].total + values[1];
        return values[0];
    });
}

module.exports = {
    saveData: saveData,
    getTenantMonthlySummary: getTenantMonthlySummary,
    getTenantYearlySummary: getTenantYearlySummary,
    getAllTenantsMonthlySummary: getAllTenantsMonthlySummary,
    perPersonMonthlySummary: perPersonMonthlySummary,
    save: save
};
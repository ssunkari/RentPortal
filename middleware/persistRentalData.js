var moment = require('moment');
var fileHelper = require('./fileHelper');
var _ = require('lodash');
var logger = require('./logger');
var redisClient = require('../redisClient');
var promise = require('bluebird');

function save(key, value) {
    return promise.resolve(redisClient.set(key, value));
}

function saveData(formData) {
    console.log('Started to Save to Redis Db');
    var selectedDate = moment(formData.selectedDay, 'YYYYMMDD');
    var month = selectedDate.format('MM');
    var year = selectedDate.format('YYYY');
    var day = selectedDate.format('DD');
    var key = year + '::' + month;
    redisClient.getAsync(key).then(function (docFromStore) {
        return normaliseData(docFromStore, formData, day);
    }).then(function (docToStore) {
        redisClient.set(key, docToStore);
    });
    console.log('Saved to Redis Db Successfully');
};

function normaliseData(dataFromDocStore, formData, selectedDay) {
    console.log('----normalising Data: initital data fetch from redis----');
    console.objectLog(dataFromDocStore);
    if (!dataFromDocStore) {
        dataFromDocStore = '{}';
    }
    dataFromDocStore = JSON.parse(dataFromDocStore);

    if (!dataFromDocStore[selectedDay]) {
        dataFromDocStore[selectedDay] = {};
    }

    dataFromDocStore[selectedDay][formData.tenants] = {
        util: {
            gas: {
                amount: formData.gas
            },
            electricity: {
                amount: formData.electricity
            },
            household: {
                amount: formData.household
            }
        }
    }
    console.log('Data After Normalising : ');
    console.objectLog(dataFromDocStore);
    return JSON.stringify(dataFromDocStore);

}

function getTenantMonthlySummary(ctx) {
    var key = ctx.year + '::' + ctx.month;
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
    var listOfTenants = ["Srinu", "George", "Sam", "Vikram"];
    return promise.all(listOfTenants.map(function (tenant) {
        ctx.tenantName = tenant;
        return getTenantMonthlySummary(ctx);
    }));

}

function getHouseConfig(key) {
    return redisClient
        .getAsync(key).then(function (data) {
            return JSON.parse(data);
        });
}

function getFixedMonthlyHouseRentPerTenant() {
    return getHouseConfig('houseConfig').then(function (houseConfig) {
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
        var key = ctx.year + '::' + month;
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
    var getTenantSummaryFromMonthlyDataFile = redisClient.getAsync(key).then(function (docFromStore) {

            return JSON.parse(docFromStore);
        }).then(function (docFromStoreInJson) {
            console.log('Raw Data From Store ================');
            // console.objectLog(docFromStoreInJson);
            return _.filter(docFromStoreInJson, ctx.tenantName).map(function (tenantData) {
                return tenantData[ctx.tenantName];

            });
        })
        .then(function (tenantUtilInfoForMonth) {

            var gas = _.sum(tenantUtilInfoForMonth, function (tenant) {
                return tenant.util.gas.amount;
            });
            var electricity = _.sum(tenantUtilInfoForMonth, function (tenant) {
                return tenant.util.electricity.amount;
            });
            var household = _.sum(tenantUtilInfoForMonth, function (tenant) {
                return tenant.util.household.amount;
            });
            var runningTotal = gas + electricity + household;

            return {
                gas: gas,
                electricity: electricity,
                household: household,
                runningTotal: runningTotal
            };
        });

    return promise.all([perPersonMonthlySummary(ctx), getTenantSummaryFromMonthlyDataFile])
        .then(function (values) {
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
    var key = ctx.year + '::' + ctx.month;

    var monthlySummary = redisClient.getAsync(key)
        .then(function (data) {
            return JSON.parse(data);
        })
        .then(function (content) {
            var reducedArray = _.chain(content)
                .map(function (dayData) {
                    return dayData;
                })
                .map(function (tenantData) {
                    return _.map(tenantData, 'util');
                })
                .flatten()
                .value();

            var totalUtilityExpensesForMonthForAlltenants = _.sum(reducedArray, function (util) {
                return util.gas.amount + util.electricity.amount + util.household.amount;
            });
            var gas = _.sum(reducedArray, function (util) {
                return util.gas.amount;
            });
            var electricity = _.sum(reducedArray, function (util) {
                return util.electricity.amount;
            });
            var household = _.sum(reducedArray, function (util) {
                return util.household.amount;
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
    })
}

module.exports = {
    saveData: saveData,
    getTenantMonthlySummary: getTenantMonthlySummary,
    getTenantYearlySummary: getTenantYearlySummary,
    getAllTenantsMonthlySummary: getAllTenantsMonthlySummary,
    perPersonMonthlySummary: perPersonMonthlySummary,
    getHouseConfig: getHouseConfig,
    save: save
};
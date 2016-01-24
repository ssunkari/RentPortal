var moment = require('moment');
var fileHelper = require('./fileHelper');
var _ = require('lodash');
var logger = require('./logger');
var redisDocStore = require('../redisDocStore');
var promise = require('bluebird');
var redis = require("redis");
promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);
var redisClient = redis.createClient(10423, 'pub-redis-10423.us-east-1-3.1.ec2.garantiadata.com', {
    no_ready_check: true
});
redisClient.auth('mlg1plTOvmQrxOft', function (err) {
    if (err) {
        throw err;
    }
});

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
    var responses = [];
    listOfTenants.forEach(function (tenant) {
        ctx.tenantName = tenant;
        responses.push(getTenantMonthlySummary(ctx));
    });

    return responses;

}

function getHouseConfig(key) {
    return redisClient.getAsync(key).then(function (data) {
        return JSON.parse(data);
    });
}

function getFixedMonthlyHouseRentPerTenant() {
    return getHouseConfig('houseConfig').then(function (houseConfig) {
        return houseConfig.total_rent / houseConfig.num_of_tenants;
    });
}

function getTenantYearlySummary(ctx) {
    var response = {
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
    var responses = [];
    monthsInYear.forEach(function (month) {
        var key = ctx.year + '::' + month;
        responses.push(getTenantSummaryFromMonthlyDataFile(key, ctx));
    });
    return promise.all(responses, function (item) {
        _.forEach(item, function (monthly) {
            console.log('Promises Loop');
            console.objectLog(monthly);
            response.total += monthly.total;
            response.runningTotal += monthly.runningTotal;
            response.util.gas += monthly.gas;
            response.util.electricity += monthly.electricity;
            response.util.household += monthly.household;
        });
        return response;

    }).then(function (response) {
        return response;
    });
    return promise.resolve(response);
    // responses.forEach(function (item) {
    //     response.total += item.total;
    //     response.runningTotal += item.runningTotal;
    //     response.util.gas += item.gas;
    //     response.util.electricity += item.electricity;
    //     response.util.household += item.household;
    // });

    // return response;
}

function getTenantSummaryFromMonthlyDataFile(key, ctx) {
    console.log('getTenantSummaryFromMonthlyDataFile');
    var getTenantSummaryFromMonthlyDataFile = redisClient.getAsync(key).then(function (docFromStore) {

            return JSON.parse(docFromStore);
        }).then(function (docFromStoreInJson) {
            console.log('Raw Data From Store ================');
            console.objectLog(docFromStoreInJson);
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

    // var total = perPersonMonthlySummary(ctx).then(function (data) {
    //     return data.total - runningTotal
    // });
    // return {
    //     total: total,
    //     runningTotal: gas + electricity + household,
    //     gas: gas,
    //     electricity: electricity,
    //     household: household
    // };
    // });
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

    // var content = redisClient.get(key, function (err, reply) {
    //     if (err) {
    //         throw err;
    //     }
    //     return reply.toString();
    // });
    // console.log('-=========----');
    // console.objectLog(content);
    // var reducedArray = _.chain(content)
    //     .map(function (dayData) {
    //         return dayData;
    //     })
    //     .map(function (tenantData) {
    //         return _.map(tenantData, 'util');
    //     })
    //     .flatten()
    //     .value();
    // var totalUtilityExpensesForMonthForAlltenants = _.sum(reducedArray, function (util) {
    //     return util.gas.amount + util.electricity.amount + util.household.amount;
    // });
    // var gas = _.sum(reducedArray, function (util) {
    //     return util.gas.amount;
    // });
    // var electricity = _.sum(reducedArray, function (util) {
    //     return util.electricity.amount;
    // });
    // var household = _.sum(reducedArray, function (util) {
    //     return util.household.amount;
    // });
    // var fixedHouseRentPerTenant = getFixedMonthlyHouseRentPerTenant()
    // response.total = fixedHouseRentPerTenant + totalUtilityExpensesForMonthForAlltenants / 4;
    // response.util = {
    //     gas: gas,
    //     electricity: electricity,
    //     household: household
    // };
    // return response;
}

function normalizeData(fileContents, data, day) {
    if (!fileContents) {
        fileContents = {};
    }
    filecontents = JSON.parse(fileContents);
    if (!fileContents[day]) {
        console.log('filr', fileContents[day]);
        fileContents[day] = {};
        console.error('filr 2', day);
    }
    console.log('filecontents 1');
    console.objectLog(fileContents);
    console.log('day is', day);

    fileContents[day][data.tenants] = {
        util: {
            gas: {
                amount: data.gas
            },
            electricity: {
                amount: data.electricity
            },
            household: {
                amount: data.household
            }
        }
    }
    console.log('filecontents ');
    console.objectLog(fileContents);
    return fileContents;

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
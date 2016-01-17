var moment = require('moment');
var fileHelper = require('./fileHelper');
var _ = require('lodash');

function saveData(data) {
    var selectedDate = moment(data.selectedDay, 'YYYYMMDD');
    var month = selectedDate.format('MM');
    var year = selectedDate.format('YYYY');
    var day = selectedDate.format('DD');
    var filename = 'data/' + year + '::' + month + '.json';
    var content = fileHelper.readFileContentInJson(filename);
    fileHelper.save(filename, JSON.stringify(normalizeData(content, data, day)));
};

function getTenantMonthlySummary(ctx) {
    var filename = 'data/' + ctx.year + '::' + ctx.month + '.json';
    var response = {
        tenantName: ctx.tenantName,
        year: ctx.year,
        month: ctx.month
    };

    var getTenantSummary = getTenantSummaryFromMonthlyDataFile(filename, ctx);
    response.total = getTenantSummary.total;
    response.util = {
        gas: getTenantSummary.gas,
        electricity: getTenantSummary.electricity,
        household: getTenantSummary.household
    };
    return response;
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

function getFixedMonthlyHouseRentPerTenant() {
    var houseConfig = fileHelper.readFileContentInJson('data/houseConfig.json');
    return houseConfig.total_rent / houseConfig.num_of_tenants;
}

function getTenantYearlySummary(ctx) {
    var response = {
        tenantName: ctx.tenantName,
        year: ctx.year,
        total: 0,
        util: {
            gas: 0,
            electricity: 0,
            household: 0
        }

    };
    var monthsInYear = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var responses = [];
    monthsInYear.forEach(function (month) {
        var filename = 'data/' + ctx.year + '::' + month + '.json';
        responses.push(getTenantSummaryFromMonthlyDataFile(filename, ctx));
    });
    responses.forEach(function (item) {
        response.total = response.total + item.total;
        response.util.gas += item.gas;
        response.util.electricity += item.electricity;
        response.util.household += item.household;
    })

    return response;
}

function getTenantSummaryFromMonthlyDataFile(filename, ctx) {
    var content = fileHelper.readFileContentInJson(filename);

    var reducedArray = _.filter(content, ctx.tenantName).map(function (tenantData) {
        return tenantData[ctx.tenantName];
    });

    var total = _.sum(reducedArray, function (obj) {
        return obj.util.gas.amount;
    });
    var gas = _.sum(reducedArray, function (tenant) {
        return tenant.util.gas.amount;
    });
    var electricity = _.sum(reducedArray, function (tenant) {
        return tenant.util.electricity.amount;
    });
    var household = _.sum(reducedArray, function (tenant) {
        return tenant.util.household.amount;
    });
    return {
        total: gas + electricity + household,
        gas: gas,
        electricity: electricity,
        household: household
    };
}

function perPersonMonthlySummary(ctx) {

    var filename = 'data/' + ctx.year + '::' + ctx.month + '.json';
    var response = {
        year: ctx.year,
        month: ctx.month
    };

    var content = fileHelper.readFileContentInJson(filename);
    var util
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
    var fixedHouseRentPerTenant = getFixedMonthlyHouseRentPerTenant()
    response.total = fixedHouseRentPerTenant + totalUtilityExpensesForMonthForAlltenants / 4;
    response.util = {
        gas: gas,
        electricity: electricity,
        household: household
    };
    console.log(JSON.stringify(response, null, 3));
    return response;
}

function normalizeData(fileContents, data, day) {
    if (!fileContents) {
        fileContents = {};
    }
    if (!fileContents[day]) {
        fileContents[day] = {};
    }
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
    return fileContents;

}

module.exports = {
    saveData: saveData,
    getTenantMonthlySummary: getTenantMonthlySummary,
    getTenantYearlySummary: getTenantYearlySummary,
    getAllTenantsMonthlySummary: getAllTenantsMonthlySummary,
    perPersonMonthlySummary: perPersonMonthlySummary
};
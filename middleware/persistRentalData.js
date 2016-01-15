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

function getTentantData(ctx) {
    var filename = 'data/' + ctx.year + '::' + ctx.month + '.json';
    content = fileHelper.readFileContentInJson(filename);
    var response = {
        tenantName: ctx.tenantName,
        year: ctx.year,
        month: ctx.month
    };

    var reducedArray = _.map(content, ctx.tenantName);

    var total = _.sum(reducedArray, function (obj) {
        return obj.util.gas.amount;
    })
    response.total = total
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
    getTentantData: getTentantData
};
var moment = require('moment');
require('moment-range');
var redisStore = require('./redis/redisStore');
var Promise = require('bluebird');

function formatDayOrMonth(input) {
    if (input < 10) {
        return '0' + input;
    }
    return input;
}

function addShareObject(utilType, amount) {
    if (amount) {
        return {
            utilType: utilType,
            amount: amount,
            shared: parseFloat(amount) / 4

        };
    }
}

module.exports = {
    getByDates: function getByDates(user, dates) {
        var dateRange = moment.range(
            moment(dates.startDate, 'YYYY-MM-DD'),
            moment(dates.endDate, 'YYYY-MM-DD'));

        var datesArray = [];
        dateRange.by('days', function (moment) {
            datesArray.push(moment);
        });

        console.log('Dates to retrieve', datesArray.length);

        return Promise.resolve(datesArray).map(function (moment) {
            var year = moment.get('year');
            var month = moment.get('month') + 1;
            var day = moment.get('date');
            var key = year + '::' + formatDayOrMonth(month) + '::' + formatDayOrMonth(day) + '::' + user;
            console.log('getByDates Key::', key);
            return key;
        }).map(function (key) {
            return redisStore.getByKey(key);
        }).map(function (userUtilInfoByDay) {

            if (userUtilInfoByDay) {
                console.log(userUtilInfoByDay.costName);
                var modifiedEnpensesObj = {
                    purchaseDate: userUtilInfoByDay.selectedDay,
                    tenantName: userUtilInfoByDay.tenants,
                    costName: userUtilInfoByDay.costName,
                    expenses: []
                };
                if (userUtilInfoByDay.gas) {
                    modifiedEnpensesObj.expenses.push(addShareObject('gas', userUtilInfoByDay.gas));
                }
                if (userUtilInfoByDay.electricity) {
                    modifiedEnpensesObj.expenses.push(addShareObject('electricity', userUtilInfoByDay.electricity));
                }
                if (userUtilInfoByDay.household) {
                    modifiedEnpensesObj.expenses.push(addShareObject('household', userUtilInfoByDay.household));
                }
                return modifiedEnpensesObj;
            }
        }).filter(function (dayData) {
            if (dayData) {
                return dayData;
            }
        });
    }
};
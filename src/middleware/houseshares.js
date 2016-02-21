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
            return redisStore.getByWildcardKey(key)
                .then(function (values) {
                    return Promise.all(values.map(function (keyValue) {
                        return keyValue.value;

                    }));
                });
        }).then(function (promises) {
            return Promise.all(promises);

        }).map(function (userUtilInfoByDay) {

            if (userUtilInfoByDay && userUtilInfoByDay.length > 0) {
                var userUtilInfoDayData = userUtilInfoByDay[0];
                console.log(userUtilInfoDayData.costName);
                var modifiedEnpensesObj = {
                    purchaseDate: userUtilInfoDayData.selectedDay,
                    tenantName: userUtilInfoDayData.tenants,
                    costName: userUtilInfoDayData.costName,
                    expenses: []
                };
                if (userUtilInfoDayData.gas) {
                    modifiedEnpensesObj.expenses.push(addShareObject('gas', userUtilInfoDayData.gas));
                }
                if (userUtilInfoDayData.electricity) {
                    modifiedEnpensesObj.expenses.push(addShareObject('electricity', userUtilInfoDayData.electricity));
                }
                if (userUtilInfoDayData.household) {
                    modifiedEnpensesObj.expenses.push(addShareObject('household', userUtilInfoDayData.household));
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
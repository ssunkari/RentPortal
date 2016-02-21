$(function () {
    var date = new Date();
    var currentYear = date.getFullYear();
    var curMonth = date.getMonth() + 1;
    if (curMonth < 10) {
        curMonth = '0' + curMonth;
    }

    Array.prototype.find = function (predicate) {
        if (this === null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        var value;

        for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
                return value;
            }
        }
        return undefined;
    };

    function filterArrayBy(array, filterName) {
        return array.find(function (curValue) {
            return curValue.name === filterName;
        });
    }

    $.get("/total/" + currentYear + "/Srinu", function (result) {
        var monthNames = ['Jan',
            'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        var yearlyRentFigures = result[0].data;
        var yearlyTotalRent = monthNames.map(function (curvalue, index, monthNames) {
            return {
                x: curvalue,
                y: yearlyRentFigures[index]
            };

        });
        Morris.Bar({
            element: 'yearly-rent-breakdown-bar-chart',
            data: yearlyTotalRent,
            xkey: 'x',
            ykeys: ['y'],
            labels: ['Rent/Month Including Bills'],
            hideHover: 'auto',
            resize: true
        });
    });
    $.get("/util/total/" + currentYear, function (result) {
        var monthNames = [
            currentYear + '-01-12T19:22:47.390Z',
            currentYear + '-02-12T19:22:47.390Z',
            currentYear + '-03-12T19:22:47.390Z',
            currentYear + '-04-12T19:22:47.390Z',
            currentYear + '-05-12T19:22:47.390Z',
            currentYear + '-06-12T19:22:47.390Z',
            currentYear + '-07-12T19:22:47.390Z',
            currentYear + '-08-12T19:22:47.390Z',
            currentYear + '-09-12T19:22:47.390Z',
            currentYear + '-10-12T19:22:47.390Z',
            currentYear + '-11-12T19:22:47.390Z',
            currentYear + '-12-12T19:22:47.390Z',
        ];
        var yearlyRentFigures = result;
        var electricityData = filterArrayBy(result, 'electricity');
        var gasData = filterArrayBy(result, 'gas');
        var householdData = filterArrayBy(result, 'household');

        var utilYearlySummary = monthNames.map(function (curvalue, index, monthNames) {

            return {
                month: curvalue,
                electricity: electricityData.data[index],
                gas: gasData.data[index],
                household: householdData.data[index],
            };

        });
        Morris.Area({
            element: 'yearly-util-summary-area-chart',
            data: utilYearlySummary,
            xkey: 'month',
            ykeys: ['electricity', 'gas', 'household'],
            labels: ['electricity', 'gas', 'household'],
            pointSize: 2,
            hideHover: 'auto',
            resize: true
        });
    });

    $.get("all/total/" + currentYear + "/" + curMonth, function (result) {
        Morris.Donut({
            element: 'current-month-util-summary',
            data: result.map(function (user) {
                return {
                    label: user.tenantName,
                    value: user.total
                }
            }),
            resize: true
        });
    });

});
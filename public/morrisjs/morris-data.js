$(function () {
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

    $.get("/total/2016/Srinu", function (result) {
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
    $.get("/util/total/2016", function (result) {
        var monthNames = [
            '2016-01-12T19:22:47.390Z',
            '2016-02-12T19:22:47.390Z',
            '2016-03-12T19:22:47.390Z',
            '2016-04-12T19:22:47.390Z',
            '2016-05-12T19:22:47.390Z',
            '2016-06-12T19:22:47.390Z',
            '2016-07-12T19:22:47.390Z',
            '2016-08-12T19:22:47.390Z',
            '2016-09-12T19:22:47.390Z',
            '2016-10-12T19:22:47.390Z',
            '2016-11-12T19:22:47.390Z',
            '2016-12-12T19:22:47.390Z',
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
    // Morris.Area({
    //     element: 'morris-area-chart',
    //     data: [{
    //         period: '2010 Q1',
    //         iphone: 2666,
    //         ipad: null,
    //         itouch: 2647
    //     }, {
    //         period: '2010 Q2',
    //         iphone: 2778,
    //         ipad: 2294,
    //         itouch: 2441
    //     }, {
    //         period: '2010 Q3',
    //         iphone: 4912,
    //         ipad: 1969,
    //         itouch: 2501
    //     }, {
    //         period: '2010 Q4',
    //         iphone: 3767,
    //         ipad: 3597,
    //         itouch: 5689
    //     }, {
    //         period: '2011 Q1',
    //         iphone: 6810,
    //         ipad: 1914,
    //         itouch: 2293
    //     }, {
    //         period: '2011 Q2',
    //         iphone: 5670,
    //         ipad: 4293,
    //         itouch: 1881
    //     }, {
    //         period: '2011 Q3',
    //         iphone: 4820,
    //         ipad: 3795,
    //         itouch: 1588
    //     }, {
    //         period: '2011 Q4',
    //         iphone: 15073,
    //         ipad: 5967,
    //         itouch: 5175
    //     }, {
    //         period: '2012 Q1',
    //         iphone: 10687,
    //         ipad: 4460,
    //         itouch: 2028
    //     }, {
    //         period: '2012 Q2',
    //         iphone: 8432,
    //         ipad: 5713,
    //         itouch: 1791
    //     }],
    //     xkey: 'period',
    //     ykeys: ['iphone', 'ipad', 'itouch'],
    //     labels: ['iPhone', 'iPad', 'iPod Touch'],
    //     pointSize: 2,
    //     hideHover: 'auto',
    //     resize: true
    // });

    Morris.Donut({
        element: 'morris-donut-chart',
        data: [{
            label: "Download Sales",
            value: 12
        }, {
            label: "In-Store Sales",
            value: 30
        }, {
            label: "Mail-Order Sales",
            value: 20
        }],
        resize: true
    });

});
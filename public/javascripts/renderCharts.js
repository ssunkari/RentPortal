$(function () {
    $.get("/total/2016/Srinu", function (data) {
        $('#yearlyCurTenant').highcharts({
            title: {
                text: 'Your yearly rent summary',
                x: -20 //center
            },
            subtitle: {
                text: 'Source: RentPortal.herokuapp.com',
                x: -20
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ]
            },
            yAxis: {
                title: {
                    text: 'Amount (GBP)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: 'GBP'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: data
        });
    });

    $.get("/util/total/2016", function (data) {
        $('#util').highcharts({
            title: {
                text: 'Yearly util Summary',
                x: -20 //center
            },
            subtitle: {
                text: 'Source: RentPortal.herokuapp.com',
                x: -20
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                ]
            },
            yAxis: {
                title: {
                    text: 'Amount (GBP)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: 'GBP'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
            },
            series: data
        });
    });
});
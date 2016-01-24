var messageTester = require('./messageTester');
var testData = require('./testData');
var fileHelper = require('../middleware/fileHelper');
var redis = require("redis");

var _ = require('lodash');
var redisClient = redis.createClient(10423, 'pub-redis-10423.us-east-1-3.1.ec2.garantiadata.com', {
    no_ready_check: true
});
redisClient.auth('mlg1plTOvmQrxOft', function (err) {
    if (err) {
        throw err;
    }
});

function sleep(s) {
    var e = new Date().getTime() + (s * 1000);

    while (new Date().getTime() <= e) {}
}

describe('Get tenant monthly utility summary', function () {
    this.timeout(5000);
    before(function (done) {
        redisClient.delWildcard('*::*', done);
    });
    before(function (done) {
        messageTester.messageTester({
            "total_rent": "650",
            "num_of_tenants": "4"
        }, 'admin/houseConfig', done);
    });
    before(function (done) {
        messageTester.messageTester(testData.sriUtilFor0314, done);
    });

    it('should return tenant monthly summary', function (done) {
        sleep(3);
        var expectedResponse = {
            tenantName: 'Srinu',
            year: '2016',
            month: '03',
            total: 147.5,
            runningTotal: 20,
            util: {
                gas: 20,
                electricity: 0,
                household: 0
            }
        };
        messageTester.roomTotalTester({
            year: '2016',
            month: '03',
            tenantName: 'Srinu'
        }, expectedResponse, done);
    });
});
describe.only('with two day data setup', function () {
    this.timeout(6000);
    before(function (done) {
        redisClient.delWildcard('*::*', done);
    });
    before(function (done) {
        messageTester.messageTester({
            "total_rent": "650",
            "num_of_tenants": "4"
        }, 'admin/houseConfig', done);
    });
    before(function (done) {
        messageTester.messageTester(testData.sriUtilFor0314);
        sleep(2);
        messageTester.messageTester(testData.sriUtilFor0315);
        done();

    });
    before(function (done) {
        done();
    });

    it('should return tenant summary', function (done) {
        sleep(3);
        var expectedResponse = {
            tenantName: '3rinu',
            year: '2016',
            month: '03',
            total: 117.5,
            runningTotal: 60,
            util: {
                gas: 20,
                electricity: 40,
                household: 0
            }
        };
        messageTester.roomTotalTester({
            year: '2016',
            month: '03',
            tenantName: 'Srinu'
        }, expectedResponse, done);
    });
});

describe('Get particular tenant total', function () {
    this.timeout(5000);
    before(function (done) {
        redisClient.delWildcard('*::*', done);
    });
    before(function (done) {
        messageTester.messageTester({
            "total_rent": "650",
            "num_of_tenants": "4"
        }, 'admin/houseConfig', done);
    });
    describe('Given data for two tenants', function () {

        before(function (done) {
            messageTester.messageTester(testData.sriUtilFor0315, done);

        });
        before(function (done) {
            messageTester.messageTester(testData.georgeUtilFor0315, done);

        });

        it('should return tenant total', function (done) {
            sleep(3);
            var expectedResponse = {
                tenantName: 'George',
                year: '2016',
                month: '03',
                total: 142.5,
                runningTotal: 40,
                util: {
                    gas: 40,
                    electricity: 0,
                    household: 0
                }
            };
            messageTester.roomTotalTester({
                year: '2016',
                month: '03',
                tenantName: 'George'
            }, expectedResponse, done);
        });
    });
});

describe('Get tenant yearly utility summary', function () {
    this.timeout(5000);
    describe('with two months data', function () {
        before(function (done) {
            redisClient.delWildcard('*::*', done);
        });
        before(function (done) {
            messageTester.messageTester({
                "total_rent": "650",
                "num_of_tenants": "4"
            }, 'admin/houseConfig', done);
        });
        before(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, done);
        });
        before(function (done) {
            messageTester.messageTester(testData.sriUtilFor0414, done);
        });

        it('should return tenant yearly breakdown', function (done) {
            sleep(3);
            var expectedResponse = {
                tenantName: 'Srinu',
                year: '2016',
                runningTotal: 120,
                total: 1830,
                util: {
                    gas: 120,
                    electricity: 0,
                    household: 0
                }
            };
            messageTester.roomTotalTester({
                year: '2016',
                tenantName: 'Srinu'
            }, expectedResponse, done);
        });

    });
});

describe('Completele breakdown summary of a tenant monthly expenses', function () {
    this.timeout(5000);
    describe('with two tenants data', function () {
        before(function (done) {
            redisClient.delWildcard('*::*', done);
        });
        before(function (done) {
            messageTester.messageTester({
                "total_rent": "650",
                "num_of_tenants": "4"
            }, 'admin/houseConfig', done);
        });
        before(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, done);
        });
        before(function (done) {
            messageTester.messageTester(testData.georgeUtilFor0315, done);
        });

        it('should return tenant monthly summary', function (done) {
            sleep(3);
            var expectedResponse = [{
                tenantName: 'Srinu',
                year: '2016',
                month: '03',
                total: 157.5,
                runningTotal: 20,
                util: {
                    gas: 20,
                    electricity: 0,
                    household: 0
                }
            }, {
                tenantName: 'George',
                year: '2016',
                month: '03',
                runningTotal: 40,
                total: 137.5,
                util: {
                    gas: 40,
                    electricity: 0,
                    household: 0
                }
            }, {
                tenantName: 'Sam',
                year: '2016',
                month: '03',
                total: 177.5,
                runningTotal: 0,
                util: {
                    gas: 0,
                    electricity: 0,
                    household: 0
                }
            }, {
                tenantName: 'Vikram',
                year: '2016',
                month: '03',
                total: 177.5,
                runningTotal: 0,
                util: {
                    gas: 0,
                    electricity: 0,
                    household: 0
                }
            }];
            messageTester.roomTotalTester({
                year: '2016',
                month: '03',
            }, expectedResponse, 'all', done);
        });

    });
});

describe('Get tenant monthly expenditure summary', function () {
    this.timeout(5000);
    describe('with two tenants data', function () {
        before(function (done) {
            redisClient.delWildcard('*::*', done);
        });
        before(function (done) {
            messageTester.messageTester({
                "total_rent": "650",
                "num_of_tenants": "4"
            }, 'admin/houseConfig', done);
        });
        before(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, done);
        });
        before(function (done) {
            messageTester.messageTester(testData.georgeUtilFor0315, done);
        });

        it('should return tenant total including own expenses', function (done) {
            sleep(3);
            var expected = {
                year: '2016',
                month: '03',
                total: 177.5,
                util: {
                    gas: 60,
                    electricity: 0,
                    household: 0
                }
            };
            messageTester.roomTotalTester({
                year: '2016',
                month: '03',
            }, expected, 'perperson', done);
        });

    });
});

describe('House configuration', function () {
    describe('Set House Configuration', function () {
        var houseConfig = {
            "total_rent": "650",
            "num_of_tenants": "4"
        };
        before(function (done) {
            messageTester.messageTester(houseConfig, 'admin/houseConfig', done);
        });
        describe('Get House Configuration', function () {
            it('should reutn tenant configuration', function (done) {
                messageTester.reqPostTester('/admin/houseConfig', houseConfig, done);
            });
        });
    });
});
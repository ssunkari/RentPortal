var messageTester = require('../messageTester');
var redisClient = require('../../src/middleware/redis/redisStore');
var testData = require('../testData');
describe('Tenant monthly summary', function () {
    this.timeout(5000);
    beforeEach(function (done) {
        redisClient.flushdb(function (err, didSucceed) {
            console.log('Deletion status :', didSucceed);
            done();
        });
    });
    beforeEach(function (done) {
        messageTester.messageTester({
            "total_rent": "650",
            "num_of_tenants": "4"
        }, 'admin/houseConfig', done);
    });

    describe('given one month data', function () {
        beforeEach(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, done);
        });

        it('should return tenant monthly summary', function (done) {
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
    describe('with two day data setup', function () {
        beforeEach(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, function () {
                messageTester.messageTester(testData.sriUtilFor0315, done);
            });
        });
        it('should return tenant summary', function (done) {
            var expectedResponse = {
                tenantName: 'Srinu',
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
    describe('given unique multi tenant data', function () {
        beforeEach(function (done) {
            messageTester.messageTester(testData.sriUtilFor0315, done);

        });
        beforeEach(function (done) {
            messageTester.messageTester(testData.georgeUtilFor0315, done);
        });

        it('should return selected tenant total', function (done) {
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
    describe('all tenants', function () {
        describe('with two tenants data', function () {
            beforeEach(function (done) {
                messageTester.messageTester(testData.sriUtilFor0314, done);
            });
            beforeEach(function (done) {
                messageTester.messageTester(testData.georgeUtilFor0315, done);
            });

            it('should return all tenants monthly summary', function (done) {
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
});
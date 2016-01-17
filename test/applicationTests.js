var messageTester = require('./messageTester');
var testData = require('./testData');
var fileHelper = require('../middleware/fileHelper');

describe('Get tenant monthly utility summary', function () {
    describe('with one day data setup', function () {
        before(function (done) {
            fileHelper.deleteDirFiles('data', 'json');
            done();
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
        before(function (done) {
            fileHelper.deleteDirFiles('data', 'json');
            done();
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
            messageTester.messageTester(testData.sriUtilFor0315, done);

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

    describe('Get particular tenant total', function () {
        before(function (done) {
            fileHelper.deleteDirFiles('data', 'json');
            done();
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
});

describe('Get tenant yearly utility summary', function () {
    describe('with two months data', function () {
        before(function (done) {
            fileHelper.deleteDirFiles('data', 'json');
            done();
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
    describe('with two tenants data', function () {
        before(function (done) {
            fileHelper.deleteDirFiles('data', 'json');
            done();
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

    describe('Get tenant monthly expenditure summary', function () {
        describe('with two tenants data', function () {
            before(function (done) {
                fileHelper.deleteDirFiles('data', 'json');
                done();
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
});
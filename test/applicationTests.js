var messageTester = require('./messageTester');
var testData = require('./testData');
var fileHelper = require('../middleware/fileHelper');

describe('Get tenant monthly utility summary', function () {
    describe('with one day data setup', function () {
        before(function (done) {
            fileHelper.deleteFile('data/2016::03.json');
            done();
        });

        before(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, done);
        });

        it('should return tenant monthly summary', function (done) {
            var expectedResponse = {
                tenantName: 'Srinu',
                year: '2016',
                month: '03',
                total: 20,
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
            fileHelper.deleteFile('data/2016::03.json');
            done();
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
                total: 60,
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
            fileHelper.deleteFile('data/2016::03.json');
            done();
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
                    total: 40,
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
            fileHelper.deleteFile('data/2016::03.json');
            fileHelper.deleteFile('data/2016::04.json');
            done();
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
                total: 120,
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

describe('Get all tenants montly utility summary', function () {
    describe('with two tenants data', function () {
        before(function (done) {
            fileHelper.deleteFile('data/2016::03.json');
            fileHelper.deleteFile('data/2016::04.json');
            done();
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
                total: 20,
                util: {
                    gas: 20,
                    electricity: 0,
                    household: 0
                }
            }, {
                tenantName: 'George',
                year: '2016',
                month: '03',
                total: 40,
                util: {
                    gas: 40,
                    electricity: 0,
                    household: 0
                }
            }, {
                tenantName: 'Sam',
                year: '2016',
                month: '03',
                total: 0,
                util: {
                    gas: 0,
                    electricity: 0,
                    household: 0
                }
            }, {
                tenantName: 'Vikram',
                year: '2016',
                month: '03',
                total: 0,
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
var messageTester = require('./messageTester');
var testData = require('./testData');
var fileHelper = require('../middleware/fileHelper');

describe('Get total for a tenant', function () {
    describe('Get Tenant Total With one day data setup', function () {
        before(function (done) {
            fileHelper.deleteFile('data/2016::03.json');
            done();
        });

        before(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, done);
        });

        //DeleteFile Before running any tests
        it('should return tenant total', function (done) {
            var expectedResponse = {
                tenantName: 'Srinu',
                year: '2016',
                month: '03',
                total: 20
            };
            messageTester.roomTotalTester({
                year: '2016',
                month: '03',
                tenantName: 'Srinu'
            }, expectedResponse, done);
        });
    });
    describe('Get Tenant Total With two day data setup', function () {
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

        it('should return tenant total', function (done) {
            var expectedResponse = {
                tenantName: 'Srinu',
                year: '2016',
                month: '03',
                total: 60
            };
            messageTester.roomTotalTester({
                year: '2016',
                month: '03',
                tenantName: 'Srinu'
            }, expectedResponse, done);
        });
    });
});
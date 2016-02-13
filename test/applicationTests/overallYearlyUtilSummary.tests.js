var messageTester = require('../messageTester');
var redisClient = require('../../src/middleware/redis/redisStore');
var testData = require('../testData');

describe('yearly util total summary', function () {

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

    describe('with two months data', function () {
        beforeEach(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, 'expenses?user=' + testData.sriUtilFor0314.tenants, function () {
                messageTester.messageTester(testData.sriUtilFor0414, 'expenses?user=' + testData.sriUtilFor0414.tenants, done);
            });
        });
        it('should return tenant yearly breakdown', function (done) {
            var expectedResponse = [{
                name: 'gas',
                data: [0, 0, 20, 100, 0, 0, 0, 0, 0, 0, 0, 0]
            }, {
                name: 'electricity',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }, {
                name: 'household',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }, {
                name: 'combined',
                data: [0, 0, 20, 100, 0, 0, 0, 0, 0, 0, 0, 0]
            }];

            messageTester.roomTotalTester({
                    year: '2016',
                }, expectedResponse, 'util',
                done);
        });

    });

});
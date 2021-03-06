var messageTester = require('../messageTester');
var redisClient = require('../../src/middleware/redis/redisStore');
var testData = require('../testData');

describe('yearly summary', function () {

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
    beforeEach(function (done) {
        messageTester.messageTester(testData.sriUtilFor0314, 'expenses?user=' + testData.sriUtilFor0314.tenants, done);
    });
    beforeEach(function (done) {
        messageTester.messageTester(testData.sriUtilFor0414, 'expenses?user=' + testData.sriUtilFor0314.tenants, done);
    });
    describe('particular tenant', function () {
        describe('with two months data', function () {
            it('should return tenant yearly breakdown', function (done) {
                var expectedResponse = [{
                    name: 'Srinu',
                    data: [162.5,
                        162.5,
                        167.5,
                        187.5,
                        162.5,
                        162.5,
                        162.5,
                        162.5,
                        162.5,
                        162.5,
                        162.5,
                        162.5
                    ]
                }];
                messageTester.roomTotalTester({
                    year: '2016',
                    tenantName: 'Srinu'
                }, expectedResponse, done);
            });

        });
    });

});
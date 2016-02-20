var messageTester = require('../messageTester');
var redisClient = require('../../src/middleware/redis/redisStore');
var testData = require('../testData');
describe('Tenant monthly util breakdown', function () {
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

    describe('setup few days data for a tenant for same month', function () {

        beforeEach(function (done) {
            messageTester.messageTester(testData.sriUtilFor0314, 'expenses?user=' + testData.sriUtilFor0314.tenants, done);
        });

        beforeEach(function (done) {
            messageTester.messageTester(testData.sriUtilFor0315, 'expenses?user=' + testData.sriUtilFor0315.tenants, done);
        });

        it('should return util summary for selected tenant for selected days', function (done) {
            var expectedResponse = [{
                "expenses": [{
                    "amount": "20",
                    "shared": 5,
                    "utilType": "gas"
                }],
                "purchaseDate": "2016-03-14",
                "tenantName": "Srinu"
            }, {
                "expenses": [{
                    "amount": "40",
                    "shared": 10,
                    "utilType": "electricity"
                }],
                "purchaseDate": "2016-03-15",
                "tenantName": "Srinu"
            }];
            messageTester.reqPostTester('/expenses/data/houseshares?user=Srinu&startDate=2016-03-14&endDate=2016-03-15', expectedResponse, done);
        });
    });
});
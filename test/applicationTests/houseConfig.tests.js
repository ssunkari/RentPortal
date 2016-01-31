var messageTester = require('../messageTester');
describe('Store House configuration', function () {
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
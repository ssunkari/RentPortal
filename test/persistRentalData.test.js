require('should');
var persistData = require('../middleware/persistRentalData');
describe.only('Given I have a json document', function () {
    it('should save the data to file', function () {
        persistData.save('abc.log', {
            'data': 'data'
        });
        persistData.read('abc.log').should.be.equal('{"data":"data"}');
    });
});
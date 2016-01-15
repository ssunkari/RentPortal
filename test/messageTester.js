var app = require('../app');
var request = require('supertest');
var wrappedApp = function (req, res) {
    var domain = require('domain').create();
    domain.add(req);
    domain.add(res);
    domain.run(function () {
        app(req, res);
    });
};
var agent = request(wrappedApp);

function messageTester(req, done) {
    agent
        .post('/')
        .send(req)
        .expect(200)
        .end(function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
}

function roomTotalTester(request, expectedResponse, done) {
    agent
        .get('/total/:' + request.year + '/:' + request.month + '/:' + request.tenantName)
        .expect(200)
        .expect(expectedResponse)
        .end(function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
}
module.exports = {
    messageTester: messageTester,
    roomTotalTester: roomTotalTester
};
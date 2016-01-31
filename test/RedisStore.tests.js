var assert = require('chai').assert;
var redisStore = require('../src/middleware/redis/redisStore');
describe('store nested javascript obj to redis', function () {
    this.timeout(5000);
    var expectedResponse = {
        gas: 20,
        electricity: 30,
        household: 10

    };
    beforeEach(function (done) {
        redisStore.flushdb(function (err, didSucceed) {
            console.log('Deletion status :', didSucceed);
            done();
        });
    });
    beforeEach(function (done) {
        redisStore.save("2016::01::01::Srinu", ["gas", "20", "electricity", "30", "household", "10"]).then(function (res) {
            console.log('Redis Key storage status :', res);
            done();
        });
    });
    describe('get by key', function () {
        it('should retrive the key value', function (done) {

            redisStore.getByKey("2016::01::01::Srinu").then(function (result) {
                assert.equal(result.gas, expectedResponse.gas);
                assert.equal(result.electricity, expectedResponse.electricity);
                assert.equal(result.household, expectedResponse.household);
                done();
            });

        });
        it('should retrive the key value by wildcard', function (done) {
            redisStore.getByWildcardKey("2016::01::01::*").then(function (result) {
                result[0].value.then(function (value) {
                    assert.equal(value.gas, expectedResponse.gas);
                    assert.equal(value.electricity, expectedResponse.electricity);
                    assert.equal(value.household, expectedResponse.household);
                    done();
                });
            });
        });
    });
    describe('update property and get by key', function () {
        beforeEach(function (done) {
            redisStore.save("2016::01::01::Srinu", ["gas", "40"]).then(function (res) {
                console.log('Redis haskey update succeeded :', res);
                done();
            });
        });
        it('should retrive the key value', function (done) {

            redisStore.getByKey("2016::01::01::Srinu").then(function (result) {
                assert.equal(result.gas, 40);
                assert.equal(result.electricity, expectedResponse.electricity);
                assert.equal(result.household, expectedResponse.household);
                done();
            });
        });
    });
    describe('delete single property', function () {
        beforeEach(function (done) {
            redisStore.delHashKeyValue("2016::01::01::Srinu", ["gas", "40"]).then(function (res) {
                console.log('Redis has key deleted succeeded :', res);
                done();
            });
        });
        it('should retrive the key value', function (done) {

            redisStore.getByKey("2016::01::01::Srinu").then(function (result) {
                assert.notOk(result.gas);
                assert.equal(result.electricity, expectedResponse.electricity);
                assert.equal(result.household, expectedResponse.household);
                done();
            });
        });
    });

    describe('delete multiple properties', function () {
        beforeEach(function (done) {
            redisStore.delHashKeyValue("2016::01::01::Srinu", ["gas", "40", "electricity", "30"]).then(function (res) {
                console.log('Redis has key deleted succeeded :', res);
                done();
            });
        });
        it('should retrive the key value', function (done) {

            redisStore.getByKey("2016::01::01::Srinu").then(function (result) {
                assert.notOk(result.gas);
                assert.notOk(result.electricity);
                assert.equal(result.household, expectedResponse.household);
                done();
            });
        });
    });
});
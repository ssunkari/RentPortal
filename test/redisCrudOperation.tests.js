var assert = require('chai').assert;
var testData = require('./testData');
var promise = require('bluebird');

var redisClient = require('../redisClient');

describe('Redis Crud operations', function () {

    describe('store and must read the json document in the same format', function () {
        this.timeout(15000);
        describe('When I perform the insert CRUD operation', function () {
            before(function (done) {
                redisClient.set('test', JSON.stringify(testData.sriUtilFor0314));
                done();
            })
            it('should read the document in same format', function (done) {
                redisClient.get('test', function (err, reply) {
                    console.log(reply.toString()); // Will print `OK`
                    assert.ok(reply, testData.sriUtilFor0314);
                    done();

                });
            });
        });
    });

    describe('update json document', function () {
        describe('When I perform the insert CRUD operation', function () {
            var data = {
                sri: {
                    subjects: 2
                }
            };
            var expected = {
                sri: {
                    subjects: 2
                },
                vasu: {
                    subjects: 4
                }
            };
            before(function (done) {
                redisClient.set('test', JSON.stringify(data));
                done();
            })

            it('should read the document in same format', function (done) {
                redisClient.getAsync('test').then(function (data) {
                    console.log(data);
                    var deserializeData = JSON.parse(data);
                    console.dir(deserializeData);
                    deserializeData.vasu = {
                        subjects: 4
                    };
                    return deserializeData;
                }).then(function (data) {
                    console.log('setting', data);

                    redisClient.set("test", JSON.stringify(data));
                }).then(function () {
                    redisClient.get('test', function (err, reply) {
                        console.log(reply.toString()); // Will print `OK`
                        assert.equal(reply, JSON.stringify(expected));
                        done();

                    });
                });

            });
        });
    });
});
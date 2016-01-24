var assert = require('chai').assert;
var testData = require('./testData');
var promise = require('bluebird');

var redis = require("redis");
promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);
var redisClient = redis.createClient(10423, 'pub-redis-10423.us-east-1-3.1.ec2.garantiadata.com', {
    no_ready_check: true
});
redisClient.auth('mlg1plTOvmQrxOft', function (err) {
    if (err) {
        throw err;
    }
});

describe('Redis Crud operations', function () {

    describe('Store the Json Data to Redis Server', function () {
        describe('When I perform the insert CRUD operation', function () {
            it('should save the document', function (done) {
                redisClient.set('test', JSON.stringify(testData.sriUtilFor0314));
                done();
            });
        });
    });

    describe('store and must read the json document in the same format', function () {
        this.timeout(15000);
        describe('When I perform the insert CRUD operation', function () {
            // redisDocStore.persist('test', 'hello', function (err, res) {});
            redisClient.set('test', JSON.stringify(testData.sriUtilFor0314));
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
            redisClient.set('test', JSON.stringify(data));
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
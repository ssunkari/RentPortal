var promise = require('bluebird');
var redis = promise.promisifyAll(require('redis'));
var config = require('./config');
var rediscloud_url = config.get('redis:rediscloud_url');
var client = redis.createClient(rediscloud_url, {
    no_ready_check: true
});

module.exports = client;
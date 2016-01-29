var promise = require('bluebird');
var redis = promise.promisifyAll(require("redis"));
var client = redis.createClient(10423, 'pub-redis-10423.us-east-1-3.1.ec2.garantiadata.com', {
    no_ready_check: true
});

client.auth('mlg1plTOvmQrxOft', function (err) {
    if (err) {
        throw err;
    }
});

module.exports = client;
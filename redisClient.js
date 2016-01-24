var redis = require("redis");
var client = redis.createClient(10423, 'pub-redis-10423.us-east-1-3.1.ec2.garantiadata.com', {
    no_ready_check: true
});
client.auth('mlg1plTOvmQrxOft', function (err) {
    if (err) {
        throw err;
    }
});

module.exports = client;
// var redis = require('redis');
// var client = redis.createClient(10423, 'pub-redis-10423.us-east-1-3.1.ec2.garantiadata.com', {
//     no_ready_check: true
// });

// var redis = require('redis');
// bluebird.promisifyAll(redis.RedisClient.prototype);
// bluebird.promisifyAll(redis.Multi.prototype);

// function init() {
//     client.auth('mlg1plTOvmQrxOft', function (err) {
//         if (err) {
//             throw err;
//         }
//     });
//     checkConnection();
//     return client;
// }

// function checkConnection() {

//     client.on('connect', function () {
//         console.log('Connected to Redis');
//     });
// }

// var set = function (key, value, callback) {
//     client.set(key, value, function (err, res) {
//         if (!err) {
//             callback(null, 'Key Value pair stored successfully');
//         }
//     });
// }

// var get = function (key, callback) {
//     console.log('im in top get');
//     client.get(key, function (err, value) {
//         if (err) {
//             throw err;
//         }
//         console.log('====raw Data from doc===');
//         console.objectLog(value);
//         callback(null, value.toString());
//     });
// }

// module.exports = {
//     init: init,
//     checkConnection: checkConnection,
//     get: get,
//     set: set,
//     getAsync:
// }
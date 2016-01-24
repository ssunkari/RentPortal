var util = require('util');
var redis = require('redis');
var async = require('async');
Array.prototype.clear = function () {
    while (this.length) {
        this.pop();
    }
};

function sleep(s) {
    var e = new Date().getTime() + (s * 1000);

    while (new Date().getTime() <= e) {}
}

console.objectLog = function () {
    var obj = arguments[arguments.length - 1];
    var prefixes = [].slice.call(arguments, 0, arguments.length - 1);
    var message = prefixes.concat([util.inspect(obj, {
        depth: null
    })]);
    console.log.apply(console, message);
};

redis.RedisClient.prototype.delWildcard = function (key, callback) {
    var redis = this;
    redis.keys(key, function (err, rows) {
        async.each(rows, function (row, callbackDelete) {
            redis.del(row, callbackDelete)
        }, callback)
    });
}
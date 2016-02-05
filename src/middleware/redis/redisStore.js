var redisClient = require('../../redisClient');
var Promise = require('bluebird');
module.exports = {
    save: function (key, arrayOfKeyValuePairs) {
        return redisClient.hmsetAsync(key, arrayOfKeyValuePairs);
    },
    getByKey: function (key) {
        return redisClient.hgetallAsync(key);
    },
    getByWildcardKey: function (wildcardKey) {
        return Promise.all(redisClient.keysAsync(wildcardKey).then(function (keys) {
            return keys.map(function (key) {
                return {
                    key: key,
                    value: redisClient.hgetallAsync(key)
                };

            });
        }));
    },
    delHashKeyValue: function (key, hashKeyToDelete) {
        return redisClient.hdelAsync(key, hashKeyToDelete);
    },
    flushdb: function (callback) {
        return redisClient.flushdb(callback);
    }
};
'use strict';
var nconf = require('nconf');

nconf.argv();
nconf.env('_');

var environment = process.env.NODE_ENV || 'development';
var env = require('./' + environment);
nconf.overrides(env);

module.exports = {
    get: function (key) {
        return nconf.get(key);
    }
};
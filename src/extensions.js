var util = require('util');
Array.prototype.clear = function () {
    while (this.length) {
        this.pop();
    }
};

Object.mapObjectToArray = function (data_post) {
    var keyValuePair = [];
    Object.keys(data_post).map(function (key) {
        keyValuePair.push(key);
        keyValuePair.push(data_post[key]);
    });
    return keyValuePair;
};

console.objectLog = function () {
    var obj = arguments[arguments.length - 1];
    var prefixes = [].slice.call(arguments, 0, arguments.length - 1);
    var message = prefixes.concat([util.inspect(obj, {
        depth: null
    })]);
    console.log.apply(console, message);
};
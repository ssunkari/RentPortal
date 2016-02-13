var util = require('util');
Array.prototype.clear = function () {
    while (this.length) {
        this.pop();
    }
};

Object.mapObjectToArray = function (object) {
    var keyValuePair = [];
    Object.keys(object).map(function (key) {
        keyValuePair.push(key);
        keyValuePair.push(object[key]);
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
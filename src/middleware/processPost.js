module.exports = function processPost(req, callback) {
    var data = '';

    console.log('processRequest');

    req.on('data', function (chunk) {
        console.log('on data');
        data += chunk;
    });

    req.on('end', function () {
        console.log('on end');
        data = data.toString();
        callback(data);
    });
};
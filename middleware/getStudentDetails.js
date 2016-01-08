var fs = require('fs');
var path = require('path');
var _ = require('lodash');
module.exports = function getStudentDetails(stuName, callback) {
    fs.readFile(path.join(__dirname, '../src/lib/data/studentData.json'), 'utf-8', function (err, data) {
        if (err) {
            callback(err, null);
        } else {
            var serializedData = JSON.parse(data);

            console.log(Array.isArray(serializedData));
            var studentRecord = _.find(serializedData, function (name) {
                return name.user === stuName;
            });
            callback(null, studentRecord);
        }
    })
}
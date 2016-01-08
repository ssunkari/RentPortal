var fs = require('fs');

function save(filename, data) {
    fs.writeFileSync(filename, JSON.stringify(data));
};

function read(filename) {
    var content = fs.readFileSync(filename, "utf8").toString();
    console.log(content);
    return content;

};
module.exports = {
    save: save,
    read: read
};
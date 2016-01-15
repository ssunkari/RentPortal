var fs = require('fs');

function readFileContentInJson(filename) {
    if (!fs.existsSync(filename)) {
        return {};
    }
    var content = fs.readFileSync(filename, "utf8").toString();
    if (!content) {
        return {};
    }
    return JSON.parse(content);

};

function save(filename, contents) {
    fs.writeFileSync(filename, contents);
};

function deleteFile(filename) {
    fs.unlinkSync(filename);
};
module.exports = {
    readFileContentInJson: readFileContentInJson,
    save: save,
    deleteFile: deleteFile
}
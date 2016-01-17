var fs = require('fs');
var path = require('path');

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
    if (fs.existsSync(filename))
        fs.unlinkSync(filename);
};

function deleteDirFiles(directory, extension) {
    var fileNames = fs.readdirSync(directory);
    console.log(fileNames);
    fileNames.forEach(function (filename) {
        if (fs.existsSync(path.join(directory, filename)) && filename.indexOf(extension) != -1) {
            fs.unlinkSync(path.join(directory, filename));
        }
    });
};

module.exports = {
    readFileContentInJson: readFileContentInJson,
    save: save,
    deleteFile: deleteFile,
    deleteDirFiles: deleteDirFiles
}
var express = require('express');
var router = express.Router();
//var processPost = require('../middleware/processPost');

/* Post echo */
router.post('/', function (req, res, next) {
    // var reqBody = processPost(req, function (data) {
    res.send('hello');
});

module.exports = router;
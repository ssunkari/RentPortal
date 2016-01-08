var express = require('express');
var getStudentDetails = require('../middleware/getStudentDetails');
var router = express.Router();

router.get('/:stuName', function (req, res, next) {
    getStudentDetails(req.params.stuName, function (err, data) {
        if (err) {
            return next(err);
        }
        res.json(data);
    });
});

module.exports = router;
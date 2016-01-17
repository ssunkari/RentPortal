var express = require('express');
var router = express.Router();
var fileHelper = require('../middleware/fileHelper');
router.get('/', function (req, res, next) {
    res.render('admin', {
        title: 'Express'
    });
});
router.post('/houseConfig', function (req, res, next) {
    console.log(req.body);
    fileHelper.save('data/houseConfig.json', JSON.stringify(req.body));

    res.render('admin', {
        title: 'Express',
        message: 'Successfully updated the configuration'
    });
});

module.exports = router;
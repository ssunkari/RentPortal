var express = require('express');
var router = express.Router();
var persistRentalData = require('../middleware/persistRentalData');

router.get('/', function (req, res, next) {
    res.render('admin', {
        title: 'Express'
    });
});
router.post('/houseConfig', function (req, res, next) {
    var success = '';
    persistRentalData.save('houseConfig', JSON.stringify(req.body)).then(
        success = 'Successfully updated the configuration'
    );
    res.render('admin', {
        title: 'Express',
        message: success
    });
});

router.get('/houseConfig', function (req, res, next) {
    persistRentalData.getHouseConfig('houseConfig').then(function (data) {
        return res.json(data);
    })
});

module.exports = router;
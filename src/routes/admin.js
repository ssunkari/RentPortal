var express = require('express');
var router = express.Router();
var redisStore = require('../middleware/redis/redisStore');

router.get('/', function (req, res) {
    res.render('admin', {
        title: 'Express'
    });
});
router.post('/houseConfig', function (req, res) {
    var success = '';
    redisStore.save('35::stanley', Object.mapObjectToArray(req.body)).then(function () {
        success = 'Successfully updated the configuration';
        return res.render('admin', {
            title: 'Express',
            message: success
        });
    });

});

router.get('/houseConfig', function (req, res) {
    redisStore.getByKey('35::stanley').then(function (data) {
        return res.json(data);
    });
});

module.exports = router;
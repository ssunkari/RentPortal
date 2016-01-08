var express = require('express');
var router = express.Router();
var persistRentalData = require('../middleware/persistRentalData');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Rent Portal'
    });
});

/* POST home page. */
router.post('/', function (req, res, next) {
    persistRentalData.save('abc.log', req.body);
    res.render('index', {
        title: 'Rent Portal'
    });
});

module.exports = router;
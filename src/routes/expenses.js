var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/',
    //   require('connect-ensure-login').ensureLoggedIn('/'),
    function (req, res) {

        res.render('expenses', {
            title: 'Expenses Portal',
            errors: []
        });
    });

module.exports = router;
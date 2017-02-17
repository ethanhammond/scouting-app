var express = require('express');
var router = express.Router();

// /* GET api page. */
router.get('/categories', function(req, res, next) {
    res.render('api', {title: 'Paladins Inventory: Api'})
});

module.exports = router;

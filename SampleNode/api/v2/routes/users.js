var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({users: [{name: 'Timmy from api version 2'}]});
});

module.exports = router;

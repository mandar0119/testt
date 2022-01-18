var express = require('express');
var router = express.Router();
var path = require('path');
/* GET home page. */
router.get('*', function(req, res, next) {
  res.render('index');
    //  res.sendFile(path.resolve('apis/index.html'));
});


// app.use(express.static(path.join(__dirname, 'maintanancepage')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'maintanancepage/index.html'));
// });


module.exports = router;

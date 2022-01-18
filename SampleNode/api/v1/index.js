var express = require('express');
var useragent = require('express-useragent');
var app = express();
var path = require('path');
var engines = require('consolidate');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression')
app.use(compression());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

app.use(bodyParser.json({limit: '10mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(cookieParser())

app.set('views', path.resolve('./maintanancepage'));
app.engine('html', engines.mustache);
app.set('view engine', 'html');

app.use(useragent.express());

const indexrouter = require('./routes/index');
const doctors = require('./routes/doctors');
app.use("/API-docs",express.static(path.resolve('apis')));
app.use('/api/v1/authentication', doctors);
app.use('/assets', express.static(path.resolve('api/uploads')));
app.use('/', indexrouter);
// app.use(express.static(path.resolve('api/v1/builds/development/OPD-WEB')));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve('api/v1/builds/development/OPD-WEB/index.html'));
// });
// app.get('*', function(req, res){
//     res.send('what???');
// });
module.exports = app;
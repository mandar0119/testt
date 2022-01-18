var app = require('../v1');
var users = require('./routes/users');
app.use('/api/v2/authintication', users);
module.exports = app;
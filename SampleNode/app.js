var app = require('./api');
var express = require('express');
var path = require('path');

// app.use(express.static(path.join(__dirname, 'api/v1/builds/development')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'api/v1/builds/development/index.html'));
// });

// app.use(express.static(path.join(__dirname, 'api/v1/builds/production')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'api/v1/builds/production/index.html'));
// });

module.exports = app;
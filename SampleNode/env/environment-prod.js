'user strict';

var mysql = require('mysql');
const nodemailer = require('nodemailer');

var localconnection = {
    connection : mysql.createPool({
        host     : 'localhost',
        user     : 'srv15_mandarj',
        password : 's52aVbCn45sR5a2T8e5',
        database : 'NDOA',
        timezone : "UTC+0",
        port : 3306
    }),
    host : "http://srv15.computerkolkata.com:3070/assets/V1/profile/"
}
module.exports = {connection : localconnection};
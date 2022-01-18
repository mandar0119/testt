'user strict';

var mysql = require('mysql');

var localconnection = {
    connection : mysql.createPool({
        host     : 'localhost',
        user     : 'root',
        password : 'npav',
        database : 'tcerp',
        timezone : "UTC+0",
        port : 3307
    }),
    host : "http://127.0.0.1:3071/assets/V1/profile/"
}

// var localconnection = {
//     connection : mysql.createPool({
//         host     : 'localhost',
//         user     : 'srv15_mandarj',
//         password : 's52aVbCn45sR5a2T8e5',
//         database : 'tcerp',
//         timezone : "UTC+0",
//         port : 3306
//     }),
//     host : "https://tcexec.npav.net/assets/V1/profile/"
// }

module.exports = {connection : localconnection};
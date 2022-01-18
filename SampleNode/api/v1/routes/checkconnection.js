const connection = require("../../../env/environment-dev").connection.connection;
// const connection = require("../../../env/environment-prod").connection.connection;

var checkconenction = function (req, res, next) {
    if (connection.state == 'disconnected') {
        connection.connect((err) => {
            if (err) {
                throw err;
            } else {
                console.log("Database is Connected!");
                next();
            }
        })
    } else {
        next();
    }
};

module.exports = {
    connection: checkconenction,
}
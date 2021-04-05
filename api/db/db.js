var mysql = require("mysql2");

var connection = mysql.createPool({
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'database'
});

module.exports = connection;



const Sequelize = require('sequelize');

module.exports = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
    define: {
        timestamps: false
    }
});
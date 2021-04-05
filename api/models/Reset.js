const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const ResetPassword = db.define('reset_password', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false
    },
    created_at: {
        type: Sequelize.DATE,
        //allowNull: false
    },
}
);

module.exports = ResetPassword;
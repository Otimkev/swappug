const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const Follow = db.define('follows', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    follower_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
}
);

module.exports = Follow;
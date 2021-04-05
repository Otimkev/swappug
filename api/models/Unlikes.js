const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const Unlikes = db.define('unlikes', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    post_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
}
);

module.exports = Unlikes;
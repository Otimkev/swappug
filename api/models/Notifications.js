const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const Notification = db.define('notifications', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    post_id: {
        type: Sequelize.INTEGER,
    },
    sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    receiver_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    seen: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    created_at: {
        type: Sequelize.DATE,
        //allowNull: false
    },
}
);

module.exports = Notification;
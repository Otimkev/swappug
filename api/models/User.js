const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const User = db.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    first_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    last_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // country: {
    //     type: Sequelize.STRING,
    // },
    // country_code: {
    //     type: Sequelize.STRING,
    // },
    // state: {
    //     type: Sequelize.STRING,
    // },
    // city: {
    //     type: Sequelize.STRING,
    // },
    // longitude: {
    //     type: Sequelize.DOUBLE,
    // },
    // latitude: {
    //     type: Sequelize.DOUBLE,
    // },
    gcm_token: {
        type: Sequelize.STRING,
    },
    avatar: {
        type: Sequelize.STRING,
    },
    registration_date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    // status: {
    //     type: Sequelize.STRING,
    // },
    // user_type: {
    //     type: Sequelize.STRING,
    //     allowNull: false
    // },
    // is_online: {
    //     type: Sequelize.INTEGER,
    // }
}
);

module.exports = User;
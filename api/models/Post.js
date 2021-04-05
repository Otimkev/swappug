const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const Post = db.define('posts', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    },
    body: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    created_at: {
        type: Sequelize.DATE,
        //allowNull: false
    },
}
);

module.exports = Post;
const Sequelize = require('sequelize');
const db = require('../db/sequelize');

const VerificationTokens = db.define('verification_tokens', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onUpdate: "cascade",
        onDelete: "cascade",
        references: { model: "Users", key: "id" }
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false
    },
    created_at: {
        type: Sequelize.DATE,
        allowNull: false
    },
}
);

module.exports = VerificationTokens;
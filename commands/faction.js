const Discord = require('discord.js');
const client = new Discord.Client();
const quiz = require('./quiz.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

module.exports = {
    name: 'faction',
    description: 'Quiz-based role assignment.',
    DMOnly: true,
    execute(message, args) {
        const Tags = sequelize.define('faction', {
            uid: {
                type: Sequelize.STRING,
                unique: true,
            },
            score: {
                type: Sequelize.INTEGER,
                defaultValue: 500,
                allowNull: false,
            },
        });
        //do stuff here
        Tags.sync();
    },
};
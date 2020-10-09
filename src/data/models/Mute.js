'use strict';

const Sequelize = require('sequelize');

let database = require(`../database.js`);

const db = database.define('user_mutes', {
	uid: Sequelize.STRING,
	serverid: Sequelize.STRING,
	mutestart: Sequelize.STRING,
	mutefinish: Sequelize.STRING,
});

db.sync();

module.exports = db;
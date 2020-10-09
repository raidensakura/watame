'use strict';

const Sequelize = require('sequelize');

let database = require(`../database.js`);

const db = database.define('genshin_uids', {
	discord_uid: Sequelize.STRING,
	genshin_uid: Sequelize.STRING,
	server: Sequelize.STRING,
	name: Sequelize.STRING,
});

db.sync();

module.exports = db;
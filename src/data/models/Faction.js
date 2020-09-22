'use strict';

const Sequelize = require('sequelize');

let database = require(`../database.js`);

const db = database.define('Faction', {
	uid: {
		type: Sequelize.STRING,
		unique: true,
	},
	score: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});

db.sync();

module.exports = db;
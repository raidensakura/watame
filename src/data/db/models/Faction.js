'use strict';

const Sequelize = require('sequelize');

const { dbConfig } = require('../../../config.js');

let database;

if (dbConfig.dialect === 'mariadb') {
	database = require('../mariadb');
}

if (dbConfig.dialect === 'sqlite') {
	database = require('../sqlite');
}

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
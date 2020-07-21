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

const db = database.define('Mute', {
	uid: Sequelize.STRING,
	serverid: Sequelize.STRING,
	mutestart: Sequelize.STRING,
	mutefinish: Sequelize.STRING,
});

db.sync();

module.exports = db;
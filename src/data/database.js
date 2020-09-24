'use strict';

const { dbConfig } = require('../../config/config.json');

const Sequelize = require('sequelize');

module.exports = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
	host: dbConfig.host,
	dialect: dbConfig.dialect,
	dialectOptions: {
		timezone: 'Etc/GMT+8',
	},
	logging: dbConfig.enableLogging === true ? console.log : false,
	define: {
		charset: dbConfig.charset,
		timestamps: false,
	},
	storage: dbConfig.storage
});
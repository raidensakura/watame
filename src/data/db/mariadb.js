'use strict';

const { dbConfig } = require('../../config.js');

const Sequelize = require('sequelize');

module.exports = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
	dialect: dbConfig.dialect,
	dialectOptions: {
		timezone: 'Etc/GMT+8',
	},
	host: dbConfig.host,
	logging: dbConfig.enableLogging == true ? console.log : false,
	define: {
		charset: dbConfig.charset,
		timestamps: false,
	},
});
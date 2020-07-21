// For development purposes only
'use strict';

const Sequelize = require('sequelize');

module.exports = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'src/database.sqlite',
});
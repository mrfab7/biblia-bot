const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('user', {
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
		unique: true,
	},
	language: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'en',
	},
	translation: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'cpdv',
	},
});

module.exports = User;
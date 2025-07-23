const { Events } = require('discord.js');
const sequelize = require('../db');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await sequelize.authenticate();
  		await sequelize.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
const { Events } = require('discord.js');
const chalk = require('chalk');
const sequelize = require('../db');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await sequelize.authenticate();
  		await sequelize.sync();
		console.log(chalk.green(`Ready! Logged in as ${client.user.tag}`));
	},
};
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const emojis = require('../../data/emoji.json') || {};
const chalk = require('chalk');

module.exports = {
	name: 'Ping',
	category: 'utility',
	description: 'Retrieves the bot\'s latency in milliseconds.',
	usage: '/ping',
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Retrieves the bot\'s latency.'),
	async execute(interaction) {
		try {
			// Get API latency and log it
			const apiLatency = interaction.client.ws.ping !== undefined ? Math.round(interaction.client.ws.ping) : -1;
			let pingSymbol = '🏓';

			if (apiLatency === -1 || apiLatency === undefined) {
				console.error(chalk.red.bold('Failed to retrieve API latency.'));
				await interaction.reply({ content: 'Failed to retrieve API latency, please try again later.', flags: MessageFlags.Ephemeral });
				return;
			}

			if (apiLatency < 100) {
				pingSymbol = emojis.lowPing || pingSymbol;
			}
			else if (apiLatency < 250) {
				pingSymbol = emojis.mediumPing || pingSymbol;
			}
			else {
				pingSymbol = emojis.highPing || pingSymbol;
			}

			console.log(chalk.blue(`API Latency: ${apiLatency}ms`));
			// Create and send the embed message
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`${pingSymbol} Pong! Latency: \`${apiLatency}ms\``);
			await interaction.reply({ embeds: [embed] });
		}
		catch (error) {
			console.error(chalk.red.bold('Error executing ping command:'), error);
			await interaction.reply({ content: 'An error occurred while executing the command. Please try again later.', flags: MessageFlags.Ephemeral });
		}
	},
};


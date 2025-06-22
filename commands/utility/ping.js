const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const emojis = require('../../config.json').emojis || {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Retrieves the bot\'s latency.'),
	async execute(interaction) {
		try {
			// Get API latency and log it
			const apiLatency = interaction.client.ws.ping !== undefined ? Math.round(interaction.client.ws.ping) : -1;
			let pingSymbol = emojis.defaultPing || '🏓';

			if (apiLatency === -1 || apiLatency === undefined) {
				console.error('Failed to retrieve API latency.');
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

			console.log(`API Latency: ${apiLatency}ms`);
			// Create and send the embed message
			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(`${pingSymbol} Pong! Latency: \`${apiLatency}ms\``)
				.setFooter({ text: 'Ping command executed successfully.' });
			await interaction.reply({ embeds: [embed] });
		}
		catch (error) {
			console.error('Error executing ping command:', error);
			await interaction.reply({ content: 'An error occurred while executing the command. Please try again later.', flags: MessageFlags.Ephemeral });
		}
	},
};


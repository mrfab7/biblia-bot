const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Shows documentation on a command..')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The command to you need help with.')
				.setRequired(false)
				.addChoices (
					{ name: 'verse', value: 'verse' },
			        { name: 'ping', value: 'ping' },
				)),
	async execute(interaction) {
		const input = (interaction.options.getString('input') || '').toLowerCase();
		if (!interaction.client.commands.has(input) && input !== '') {
			return interaction.reply(`There is no command with name \`${input}\`!`);
		}

		if (!input) {
			const commandsList = interaction.client.commands.map(cmd => cmd.data.name).join('\n');
			return interaction.reply(`Available commands:\n${commandsList}\n\nUse \`/help <command>\` to get more information on a specific command.`);
		}
		else {
			const command = interaction.client.commands.get(input);
			return interaction.reply(
				`**${command.name || command.data.name}**\n
				Category: \`${command.category}\`\n\n
				${command.description || command.data.description}\n\n
				**Usage:**\n\`\`\`Required = <>, Optional = []\n${command.usage || ''}\`\`\`\n\n
				**Example(s):**\n\`\`\`${command.example || ''}\`\`\``,
			);
		}
	},
};
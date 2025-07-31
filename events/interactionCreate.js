const { Events, MessageFlags } = require('discord.js');
const chalk = require('chalk');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			if (interaction.isAutocomplete()) {
				await command.autocomplete(interaction);
			}
			else if (interaction.isCommand()) {
				await command.execute(interaction);
			}
		}
		catch (error) {
			console.error(chalk.red.bold(error));
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
			else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	},
};

const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const guildCommands = [];
const globalCommands = [];

// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			if (command.guildOnly) {
				guildCommands.push(command.data.toJSON());
			}
			else {
				globalCommands.push(command.data.toJSON());
			}
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		if (guildCommands.length > 0) {
			console.log(`Started refreshing ${guildCommands.length} guild (/) commands.`);
			const guildData = await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: guildCommands },
			);
			console.log(`Successfully reloaded ${guildData.length} guild (/) commands.`);
		}

		if (globalCommands.length > 0) {
			console.log(`Started refreshing ${globalCommands.length} global (/) commands.`);
			const globalData = await rest.put(
				Routes.applicationCommands(clientId),
				{ body: globalCommands },
			);
			console.log(`Successfully reloaded ${globalData.length} global (/) commands.`);
		}
	}
	catch (error) {
		console.error(error);
	}
})();

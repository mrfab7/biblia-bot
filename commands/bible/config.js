const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const User = require('../../models/user');

module.exports = {
	category: 'bible',
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Configure the Bible command settings.')
		.addSubcommand(subcomamand =>
			subcomamand
				.setName('language')
				.setDescription('Set the default language for Bible verses.')
				.addStringOption(option =>
					option
						.setName('language')
						.setDescription('The language to set as default (e.g. en, es)')
						.setRequired(true)
						.addChoices(
							{ name: 'English', value: 'en' },
							{ name: 'Español', value: 'es' },
						)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('translation')
				.setDescription('Set the default translation for Bible verses.')
				.addStringOption(option =>
					option
						.setName('translation')
						.setDescription('The translation to set as default (e.g. CPDV, KJV)')
						.setRequired(true)
						.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('View your current Bible configuration.')),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused(true).value;
		const language = interaction.options.getString('language') || 'en';
		const choices = require(`../../data/bible/${language}/translations.json`);
		const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()));
		await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.id })));
	},
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'view') {
			const user = await User.findOne({ where: { id: interaction.user.id } });
			if (!user) {
				return interaction.reply({ content: 'You have not set any Bible configuration yet.', flags: MessageFlags.Ephemeral });
			}
			return interaction.reply({ content: `Your current configuration:\nLanguage: ${user.language}\nTranslation: ${user.translation}`, flags: MessageFlags.Ephemeral });
		}
		else {
			const language = interaction.options.getString('language');
			const translation = interaction.options.getString('translation');

			let user = await User.findOne({ where: { id: interaction.user.id } });

			if (!user) {
				user = await User.create({ id: interaction.user.id, language: language || 'en', translation: translation || 'cpdv' });
			}
			else {
				if (language) {
					user.language = language;
					if (language === 'en') {
						user.translation = 'cpdv';
					}
					else if (language === 'es') {
						user.translation = 'se';
					}
				}
				if (translation) {
					user.translation = translation;
				}
			}

			await user.save();
			await interaction.reply({ content: `Configuration updated! Language: ${user.language}, Translation: ${user.translation}`, flags: MessageFlags.Ephemeral });
		}
	},
};
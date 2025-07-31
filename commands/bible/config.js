const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const User = require('../../models/user');
const dictionary = require('../../data/dictionary.json');

module.exports = {
	name: 'config',
	category: 'bible',
	description: 'Configure your settings for Biblia here.\n\n **Language**: The language you want to use for Bible verses. Currently only English and Spanish are supported.\n**Translation**: The version of the Bible you prefer. A more detailed list shows up when picking the translation.\n\nUse `/config view` to see your current settings.',
	usage: '/config <subcommand> [language/translation]',
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
						.setDescription('The translation to set as default (e.g. ASV, KJV)')
						.setRequired(true)
						.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('view')
				.setDescription('View your current Bible configuration.')),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused(true).value;

		const user = await User.findOne({ where: { id: interaction.user.id } });
		const language = interaction.options.getString('language') || user.language || 'en';

		const choices = require(`../../data/bible/${language}/translations.json`);
		const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()));
		await interaction.respond(filtered.map(choice => ({ name: `${choice.name} (${choice.id.toUpperCase()})`, value: choice.id })));
	},
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'view') {
			const user = await User.findOne({ where: { id: interaction.user.id } });
			if (!user) {
				return interaction.reply({ content: 'You have not set any Bible configuration yet.', flags: MessageFlags.Ephemeral });
			}

			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Your Biblia Configuration')
				.addFields(
					{ name: 'Accessibility', value: `Language: \`${dictionary.languages[user.language]}\`\nTranslation: \`${dictionary.translations[user.translation]}\``, inline: true });

			return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
		}
		else {
			const language = interaction.options.getString('language');
			const translation = interaction.options.getString('translation');

			let user = await User.findOne({ where: { id: interaction.user.id } });

			if (!user) {
				user = await User.create({ id: interaction.user.id, language: language || 'en', translation: translation || 'asv' });
			}
			else {
				if (language) {
					user.language = language;
					if (language === 'en') {
						user.translation = 'asv';
					}
					else if (language === 'es') {
						user.translation = 'se';
					}
				}
				if (translation) {
					user.translation = translation;
				}
			}

			const changes = `${language ? `Language set to \`${dictionary.languages[language]}\`` : ''}${translation ? `Translation set to \`${dictionary.translations[translation]}\`` : ''}`;

			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('Biblia Configuration Updated')
				.setDescription(changes);

			await user.save();
			await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
		}
	},
};
const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { fetch } = require('../../data/utility.js');
const User = require('../../models/user');

module.exports = {
	category: 'bible',
	data: new SlashCommandBuilder()
		.setName('verse')
		.setNameLocalizations({
			'es-ES': 'verso',
		})
		.setDescription('Retrieve a Bible verse by reference')
		.setDescriptionLocalizations({
			'es-ES': 'Recupera un verso de la Biblia por referencia',
		})
		.addStringOption(option =>
			option
				.setName('verse')
				.setNameLocalizations({
					'es-ES': 'verso',
				})
				.setDescription('The Bible verse to retrieve (e.g. John 3:16, Psalm 23:1, 2 Timothy 1:7)')
				.setDescriptionLocalizations({
					'es-ES': 'El verso de la Biblia a recuperar (ej. Juan 3:16, Salmo 23:1, 2 Timoteo 1:7)',
				})
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('language')
				.setNameLocalizations({
					'es-ES': 'idioma',
				})
				.setDescription('The language to use for the Bible verse (e.g. en, es)')
				.setDescriptionLocalizations({
					'es-ES': 'El idioma a usar para el verso de la Biblia (ej. en, es)',
				})
				.setRequired(false)
				.addChoices(
					{ name: 'English', value: 'en' },
					{ name: 'Español', value: 'es' },
				))
		.addStringOption(option =>
			option
				.setName('translation')
				.setNameLocalizations({
					'es-ES': 'traducción',
				})
				.setDescription('The version of the Bible to use (e.g. CPDV, KJV, BRB)')
				.setDescriptionLocalizations({
					'es-ES': 'La versión de la Biblia a usar (ej. CPDV, KJV, BRB)',
				})
				.setAutocomplete(true)
				.setRequired(false))
		.addBooleanOption(option =>
			option
				.setName('ephemeral')
				.setNameLocalizations({
					'es-ES': 'efímero',
				})
				.setDescription('Whether to send the response as ephemeral (only visible to you)')
				.setDescriptionLocalizations({
					'es-ES': 'Si enviar la respuesta como efímera (solo visible para ti)',
				})
				.setRequired(false)),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused(true).value;
		const language = interaction.options.getString('language') || 'en';
		const choices = require(`../../data/bible/${language}/translations.json`);
		const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()));
		await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.id })));
	},
	async execute(interaction) {
		const reference = interaction.options.getString('verse');
		const user = await User.findOne({ where: { id: interaction.user.id } });

		const data = await fetch(reference, user.language || 'en', user.translation || 'cpdv');
		console.log(data);

		await interaction.reply({ content: data.text, flags: interaction.options.getBoolean('ephemeral') });
	},
};
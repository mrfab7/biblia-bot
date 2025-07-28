const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { fetch } = require('../../data/fetchVerse.js');
const User = require('../../models/user');
const emoji = require('../../data/emoji.json');

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
		.setIntegrationTypes(0, 1)
		.setContexts(0, 1, 2)
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

		const user = await User.findOne({ where: { id: interaction.user.id } });
		const language = interaction.options.getString('language') || user.language || 'en';

		const choices = require(`../../data/bible/${language}/translations.json`);
		const filtered = choices.filter(choice => choice.name.toLowerCase().startsWith(focusedValue.toLowerCase()));
		await interaction.respond(filtered.map(choice => ({ name: choice.name, value: choice.id })));
	},
	async execute(interaction) {
		await interaction.deferReply();

		const user = await User.findOne({ where: { id: interaction.user.id } });

		const reference = interaction.options.getString('verse');
		const language = interaction.options.getString('language') || user.language || 'en';
		const translation = interaction.options.getString('translation') || user.translation || 'cpdv';

		const data = await fetch(reference, language, translation);
		console.log(data);

		const embed = new EmbedBuilder()
			.setColor('#fbbe47')
			.setTitle(`${data.reference} ${translation.toUpperCase()}`)
			.setDescription(`>>> ${data.text}`)
			.setFooter({ text: `${data.translation}, ${data.language}` });

		await interaction.editReply({ embeds: [embed] });
	},
};
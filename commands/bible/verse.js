const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetch } = require('../../data/fetchVerse.js');
const User = require('../../models/user');
const emoji = require('../../data/emoji.json');

module.exports = {
	name: 'verse',
	category: 'bible',
	description: 'Retrieve a Bible verse by reference.\nSupports aliases, Genesis => ge, John => jn etc.\nUse `/config <language|translation>` to set your default language and translation.',
	usage: '/verse <verse> [language] [translation] [ephemeral]',
	example: '/verse <John 3:16> [English] [American Standard Version] # returns "For God so loved the world..."\n/verse <Psalm 23:1> [Español] [La Biblia en Español Sencillo] # returns "El Señor es mi Pastor; Nada me faltará"',
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
		await interaction.respond(filtered.map(choice => ({ name: `${choice.name} (${choice.id.toUpperCase()})`, value: choice.id })));
	},
	async execute(interaction) {
		await interaction.deferReply();

		const user = await User.findOne({ where: { id: interaction.user.id } });

		const reference = interaction.options.getString('verse');
		const language = interaction.options.getString('language') || user.language || 'en';
		const translation = interaction.options.getString('translation') || user.translation || require(`../../data/bible/${language}/translations.json`)[language][0].id;

		const data = await fetch(reference, language, translation);
		if (data.error) {
			const embed = new EmbedBuilder()
				.setColor('#e66363')
				.setTitle(`${emoji.filenotfound} Error`)
				.setDescription(`An error occured while trying to retrieve the verse.\n\`\`\`${data.error}\`\`\``);

			await interaction.editReply({ embeds: [embed] });
		}
		else {
			const embed = new EmbedBuilder()
				.setColor('#fbbe47')
				.setTitle(`${emoji.bible} ${data.reference} ${translation.toUpperCase()}`)
				.setDescription(`${data.text}`);

			await interaction.editReply({ embeds: [embed] });
		}
	},
};
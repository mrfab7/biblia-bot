// Copyright (c) 2024 Jaden Zaleski
// SPDX-License-Identifier: MIT
// See LICENSE file for full license information.

const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const emojis = require('../../config.json').emojis || {};
const { fetchVerse } = require('../../bible/fetch_verse.js');

/**
 * To-do:
 * [x] Implement the actual verse retrieval logic.
 * [x] Add error handling for invalid verse formats or API errors.
 * [-] Implement autocomplete for version selection to only show valid versions based on selected language or default language.
 * [-] Add more Bible languages.
 * [-] Allow for multiple verse retrievals in a single command (e.g. John 3:16-20).
 * [-] Send the verse in an embed.
 **/

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verse')
		.setDescription('Retrieves a verse from the Bible.')
		.addStringOption(option =>
			option
				.setName('verse')
				.setDescription('The Bible verse to retrieve (e.g. John 3:16, Psalm 23:1, 2 Timothy 1:7)')
				.setRequired(true))
		.addStringOption(option =>
			option
				.setName('language')
				.setDescription('[WIP, only for testing purposes.]')
				.setRequired(false)
				.addChoices(
					{ name: 'English', value: 'en' },
				))
		.addStringOption(option =>
			option
				.setName('version')
				.setDescription('The version of the Bible to use (e.g. KJV, NIV, ESV)')
				.setRequired(false)
				.addChoices(
					{ name: 'Authorized King James Version (AKJV)', value: 'AKJV' },
					{ name: 'American Standard Version (ASV)', value: 'ASV' },
					{ name: 'Blue, Red and Gold Letter Edition of the Holy Bible (BRG)', value: 'BRG' },
					{ name: 'Evangelical Heritage Version (EHV)', value: 'EHV' },
					{ name: 'English Standard Version (ESV)', value: 'ESV' },
					{ name: 'English Standard Version Anglicised (ESVUK)', value: 'ESVUK' },
					{ name: 'Geneva (GNV)', value: 'GNV' },
					{ name: 'God\'s Word (GW)', value: 'GW' },
					{ name: 'International Standard Version (ISV)', value: 'ISV' },
					{ name: 'Jubilee Bible 2000 (JUB)', value: 'JUB' },
					{ name: 'King James Version (KJV)', value: 'KJV' },
					{ name: 'Lexham English Bible (LEB)', value: 'LEB' },
					{ name: 'Modern English Version (MEV)', value: 'MEV' },
					{ name: 'New American Standard Bible (NASB)', value: 'NASB' },
					{ name: 'New English Translation (NET)', value: 'NET' },
					{ name: 'New International Version (NIV)', value: 'NIV' },
					{ name: 'New International Version Anglicised (NIVUK)', value: 'NIVUK' },
					{ name: 'New King James Version (NKJV)', value: 'NKJV' },
					{ name: 'New Living Translation (NLT)', value: 'NLT' },
					{ name: 'New Life Version (NLV)', value: 'NLV' },
					{ name: 'Name of God Bible (NOG)', value: 'NOG' },
					{ name: 'New Revised Standard Version (NRSV)', value: 'NRSV' },
					{ name: 'New Revised Standard Version Updated Edition (NRSVUE)', value: 'NRSVUE' },
					{ name: 'World English Bible (WEB)', value: 'WEB' },
					{ name: 'Young\'s Literal Translation of the Bible (YLT)', value: 'YLT' },
				)),
	async execute(interaction) {
		try {
			const reference = interaction.options.getString('verse');
			const language = interaction.options.getString('language') || 'en';
			const version = interaction.options.getString('version') || 'ESV';

			// Fetch verse from reference
			const result = await fetchVerse(reference, language, version);

			if (result.content) {
				const verseEmbed = new EmbedBuilder()
					.setColor('#5c64f4')
					.setTitle(`${emojis.bible} ${result.reference.reference} (${result.version})`)
					.setDescription(`>>> ${result.content}`);

				await interaction.reply({ embeds: [verseEmbed] });
			}
			else {
				const errorEmbed = new EmbedBuilder()
					.setColor('#fa6969')
					.setTitle(`${emojis.filenotfound} Verse Not Found`)
					.setDescription('>>> The verse you requested could not be found. Please check the reference and try again.');
				await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
			}
		}
		catch (error) {
			console.error('Error retrieving verse:', error);
			await interaction.reply({ content: 'An error occurred while retrieving the verse. Please try again later.', flags: MessageFlags.Ephemeral });
		}
	},
};
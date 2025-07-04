const { Events, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const emojis = require('../config.json').emojis || {};
const { fetchVerse } = require('../bible/fetch_verse.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		const BibleBooks = [
			// Old Testament
			'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua',
			'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
			'1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Tobit', 'Judith',
			'Esther', '1 Maccabees', '2 Maccabees', 'Job', 'Psalms', 'Proverbs',
			'Ecclesiastes', 'Song of Solomon', 'Wisdom', 'Sirach', 'Isaiah', 'Jeremiah',
			'Lamentations', 'Baruch', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
			'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
			'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',

			// New Testament
			'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
			'1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
			'1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
			'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John',
			'3 John', 'Jude', 'Revelation',
		];

		if (message.content && message.content.length > 0) {
			const referenceRegex = /\b(?:(\d+)\s)?([A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?\b/;
			const match = message.content.match(referenceRegex);

			if (match) {
				const bookPrefix = match[1] ? `${match[1]} ` : '';
				const bookName = match[2];
				const fullBookName = `${bookPrefix}${bookName}`;
				const chapter = match[3];
				const verseStart = match[4];
				const verseEnd = match[5];
				const isBibleBook = BibleBooks.some(b => b.toLowerCase() === fullBookName.toLowerCase());

				if (isBibleBook) {
					try {
						const reference = `${fullBookName} ${chapter}:${verseStart}${verseEnd ? '-' + verseEnd : ''}`;
						console.log(reference);

						const result = await fetchVerse(reference, 'en', 'ESV');

						if (result.content) {
							const webView = new ButtonBuilder()
								.setLabel('View on Bible Gateway')
								.setURL(`https://www.biblegateway.com/passage/?search=${encodeURIComponent(result.reference.reference)}&version=${result.version}`)
								.setStyle(ButtonStyle.Link);

							const verseEmbed = new EmbedBuilder()
								.setColor('#5c64f4')
								.setTitle(`${emojis.bible} ${result.reference.reference} (${result.version})`)
								.setDescription(`>>> ${result.content}`);

							const row = new ActionRowBuilder()
								.addComponents(webView);

							await message.reply({
								embeds: [verseEmbed],
								components: [row],
							});
						}
						else if (result.error) {
							const createIssue = new ButtonBuilder()
								.setLabel('Create Issue')
								.setURL(
									'https://github.com/mrfab7/bible-bot/issues/new?assignees=&labels=bug&template=bug_report.md'
												+ '&title=Verse+Not+Found'
												+ '&body=' + encodeURIComponent('[verse.js/ERROR] An error occurred while retrieving the verse.' + '\n\n' + result.error || 'Unknown error'),
								)
								.setStyle(ButtonStyle.Link);

							const row = new ActionRowBuilder()
								.addComponents(createIssue);

							const errorEmbed = new EmbedBuilder()
								.setColor('#fa6969')
								.setTitle(`${emojis.filenotfound} Verse Not Found`)
								.setDescription(`>>> An error occured while retrieving the verse.\n\`\`\`${result.error}\`\`\``)
								.setFooter({ text: 'If you believe this is an error, please create an issue using the button below.' });

							// Log the error to the console for debugging
							console.error(result.error);

							await message.reply({
								embeds: [errorEmbed],
								components: [row],
								flags: MessageFlags.Ephemeral,
							});
						}
					}
					catch (error) {
						console.error('Error fetching verse:', error);
						const createIssue = new ButtonBuilder()
							.setLabel('Create Issue')
							.setURL(
								'https://github.com/mrfab7/bible-bot/issues/new?assignees=&labels=bug&template=bug_report.md'
												+ '&title=Verse+Not+Found'
												+ '&body=' + encodeURIComponent('[verse.js/ERROR] An error occurred while retrieving the verse.' + '\n\n' + error || 'Unknown error'),
							)
							.setStyle(ButtonStyle.Link);

						const row = new ActionRowBuilder()
							.addComponents(createIssue);

						const errorEmbed = new EmbedBuilder()
							.setColor('#fa6969')
							.setTitle(`${emojis.filenotfound} Verse Not Found`)
							.setDescription(`>>> An error occured while retrieving the verse.\n\`\`\`${error}\`\`\``)
							.setFooter({ text: 'If you believe this is an error, please create an issue using the button below.' });

						// Log the error to the console for debugging
						console.error(error);

						await message.reply({
							embeds: [errorEmbed],
							components: [row],
							flags: MessageFlags.Ephemeral,
						});
					}
				}
			}
		}
	},
};
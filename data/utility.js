const fs = require('fs');
const path = require('path');

function parseReference(reference) {
	console.log(reference);
	const parts = reference.split(' ');
	let book, chapter, verse;

	if (parts.length === 2) {
		book = parts[0].trim().toLowerCase();
		chapter = parts[1].split(':')[0].trim();
		verse = parts[1].split(':')[1] ? parts[1].split(':')[1].trim() : null;
	}
	else if (parts.length === 3) {
		book = `${parts[0]}${parts[1]}`.trim().toLowerCase();
		chapter = parts[2].split(':')[0].trim();
		verse = parts[2].split(':')[1] ? parts[2].split(':')[1].trim() : null;
	}
	else {
		throw new Error('Invalid reference format. Expected {book} {chapter}:{verse}.');
	}

	if (verse.includes('-')) {
		const lowEnd = parseInt(verse.split('-')[0].trim(), 10);
		const highEnd = parseInt(verse.split('-')[1].trim(), 10);

		verse = [];
		for (let i = lowEnd; i <= highEnd; i++) {
			console.log(i);
			verse.push(i);
		}

		verse.sort();
	}

	return { book, chapter, verse };
}

module.exports = {
	async fetch(reference, language = 'en', translation = 'cpdv') {
		const { book, chapter, verse } = parseReference(reference);
		const filePath = path.join(__dirname, '..', 'data', 'bible', language, translation, book, `${chapter}.json`);

		if (fs.existsSync(filePath)) {
			try {
				const data = require(filePath);
				if (data.data) {
					if (Array.isArray(verse)) {
						// If verse is an array (e.g., for ranges), return all corresponding verses
						const verses = [];
						verse.forEach(v => {
							if (data.data[v]) {
								console.log(`Verse: ${v}`);
								verses.push(`**[${v}]** ${data.data[v].text}`);
							}
							else {
								console.log(`Verse ${v} not found in ${filePath}`);
							}
						});

						return {
							text: verses.join(' '),
							reference: `${book} ${chapter}:${verse[0]}-${verse[verse.length - 1]}`,
							book: book,
							chapter: chapter,
							verse: `${verse[0]}-${verse[verse.length - 1]}`,
							translation: data.info.translation,
							translationID: translation,
							language: data.info.language,
							languageID: language,
						};
					}
					else {
						// If verse is a single number, return the corresponding verse text
						return {
							text: data.data[verse].text,
							reference: `${book} ${chapter}:${verse}`,
							book: book,
							chapter: chapter,
							verse: `${verse}`,
							translation: data.info.translation,
							translationID: translation,
							language: data.info.language,
							languageID: language,
						};
					}
				}
				else {
					return {
						error: `Invalid data format in file: ${filePath}`,
					};
				}
			}
			catch (err) {
				console.log(err);
			}
		}
		else {
			return {
				error: `File not found: ${filePath}`,
			};
		}
	},
};
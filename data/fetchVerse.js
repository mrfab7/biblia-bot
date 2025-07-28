const fs = require('fs');
const path = require('path');

const bibleBooks = require('../data/bible/books.json');

// Normalize string by lowercasing and stripping accents
function normalize(str) {
	return str.toLowerCase()
		.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

// Build aliasMap: normalized alias -> canonical English name
const aliasMap = {};
for (const names of Object.values(bibleBooks)) {
	const canonicalName = names.en[0];
	[...names.en, ...names.es].forEach(alias => {
		aliasMap[normalize(alias)] = canonicalName;
	});
}

console.log(`Loaded ${Object.keys(aliasMap).length} book aliases.`);

const aliasKeys = Object.keys(aliasMap).sort((a, b) => b.length - a.length);
const bookRegexPart = aliasKeys.map(alias => alias.replace(/\s+/g, '\\s+')).join('|');
const referenceRegex = new RegExp(
	`\\b(?<book>${bookRegexPart})\\b\\s+` +
  '(?<chapter>\\d+)' +
  '(?:\\:(?<verse>\\d+)(?:-(?<endVerse>\\d+))?)?',
	'i',
);

/**
 * Find the canonical English book name from any alias input.
 * @param {string} input - User input book alias
 * @returns {string} Canonical English book name or original input if not found
 */
function findAlias(input) {
	const norm = normalize(input);
	return aliasMap[norm] || input;
}

/**
 * Parses a Bible reference string into book, chapter, and verse(s).
 * @param {string} reference - Reference string, e.g. "1 Sam 3:16-18"
 * @returns {{book:string, formattedBook:string, chapter:string, verse:number|number[]|null}}
 */
function parseReference(reference) {
	const match = referenceRegex.exec(reference);

	if (!match) {
		throw new Error('Invalid reference format or unknown book name.');
	}

	const bookAlias = match.groups.book.toLowerCase().replace(/\s+/g, ' ');
	const book = findAlias(bookAlias).toLowerCase().replace(/\s+/g, '');;
	const formattedBook = findAlias(bookAlias).replace(/\b\w/g, c => c.toUpperCase());

	const chapter = match.groups.chapter;
	let verse = match.groups.verse || null;
	const endVerse = match.groups.endVerse || null;

	if (verse && endVerse) {
		const start = parseInt(verse, 10);
		const end = parseInt(endVerse, 10);
		verse = [];
		for (let v = start; v <= end; v++) {
			verse.push(v);
		}
	}
	else if (verse) {
		verse = parseInt(verse, 10);
	}
	else {
		verse = null;
	}

	return { book, formattedBook, chapter, verse };
}


module.exports = {
	async fetch(reference, language = 'en', translation = 'asv') {
		const { book, formattedBook, chapter, verse } = parseReference(reference);
		const filePath = path.join(__dirname, '..', 'data', 'bible', language, translation, 'books', book, 'chapters', chapter, 'verses', `${verse}.json`);

		if (fs.existsSync(filePath)) {
			try {
				const data = require(filePath);
				if (data) {
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
							reference: `${formattedBook} ${chapter}:${verse[0]}-${verse[verse.length - 1]}`,
							book: book,
							formattedBook: formattedBook,
							chapter: chapter,
							verse: `${verse[0]}-${verse[verse.length - 1]}`,
						};
					}
					else {
						// If verse is a single number, return the corresponding verse text
						return {
							text: data.text,
							reference: `${formattedBook} ${chapter}:${verse}`,
							book: book,
							formattedBook: formattedBook,
							chapter: chapter,
							verse: `${verse}`,
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
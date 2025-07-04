const fs = require('fs');
const path = require('path');

function parseReference(reference) {
	const parts = reference.trim().split(' ');

	let book, chapter, verse;

	if (parts.length === 3) {
		book = `${parts[0]} ${parts[1]}`.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
		chapter = parts[2].split(':')[0];
		const versePart = parts[2].split(':')[1];
		if (versePart.includes('-')) {
			const [start, end] = versePart.split('-').map(v => v.trim());
			const startNum = parseInt(start, 10);
			const endNum = parseInt(end, 10);
			verse = [];
			for (let i = startNum; i <= endNum; i++) {
				verse.push(String(i));
			}
		}
		else {
			verse = versePart;
		}
	}
	else if (parts.length === 2) {
		book = parts[0].split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
		chapter = parts[1].split(':')[0];
		const versePart = parts[1].split(':')[1];
		if (versePart.includes('-')) {
			const [start, end] = versePart.split('-').map(v => v.trim());
			const startNum = parseInt(start, 10);
			const endNum = parseInt(end, 10);
			verse = [];
			for (let i = startNum; i <= endNum; i++) {
				verse.push(String(i));
			}
		}
		else {
			verse = versePart;
		}
	}

	return { book, chapter, verse };
}

/**
 * Fetches a specific Bible verse from a local JSON file based on the given reference, language, and version.
 *
 * The function parses the reference (e.g., "John 3:16" or "2 John 1:6"), constructs the appropriate file path,
 * reads the corresponding JSON file, and retrieves the verse content if available.
 *
 * @param {string} reference - The Bible verse reference (e.g., "John 3:16", "2 John 1:6").
 * @param {string} [language='en'] - The language code for the Bible (default: 'en').
 * @param {string} [version='ESV'] - The version code for the Bible (default: 'ESV').
 * @returns {Promise<Object>} An object containing the verse content or an error message.
 *                            If found, returns { content: string } or an object with additional metadata.
 *                            If not found, returns { error: string }.
 */
async function fetchVerse(reference, language = 'en', version = 'ESV') {
	const { book, chapter, verse } = parseReference(reference);

	const filePath = path.join(__dirname, '..', 'bible', language, version, `${version}_books`, `${book}.json`);

	if (!fs.existsSync(filePath)) {
		return {
			error: `[fetch_verse.js/ERROR] Verse file not found: ${filePath}\nBook: ${book}\nChapter: ${chapter}\nVerse(s): ${Array.isArray(verse) ? verse.join(', ') : verse}\nReference: ${reference}\nLanguage: ${language}\nVersion: ${version}`,
		};
	}
	const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
	const jsonData = JSON.parse(data);

	// Handle verse range
	if (Array.isArray(verse)) {
		const versesText = [];
		for (const v of verse) {
			let text = null;
			if (jsonData[book] && jsonData[book][chapter] && jsonData[book][chapter][v]) {
				text = `(${v}) ${jsonData[book][chapter][v]}`;
			}
			else if (jsonData[chapter] && jsonData[chapter][v]) {
				text = `(${v}) ${jsonData[chapter][v]}`;
			}
			if (text) {
				versesText.push(text);
			}
		}
		if (versesText.length > 0) {
			return {
				content: versesText.join(' '),
				reference: {
					reference: `${book} ${chapter}:${verse[0]}-${verse[verse.length - 1]}`,
					book: book,
					chapter: chapter,
					verse: verse,
				},
				language: language,
				version: version,
			};
		}
		return {
			error: `[fetch_verse.js/ERROR] Verse(s) not found in the data: ${filePath}\nBook: ${book}\nChapter: ${chapter}\nVerse(s): ${verse.join(', ')}\nReference: ${reference}\nLanguage: ${language}\nVersion: ${version}`,
		};
	}

	// Try both root-level and nested book keys for flexibility
	if (jsonData[book] && jsonData[book][chapter] && jsonData[book][chapter][verse]) {
		return {
			content: jsonData[book][chapter][verse],
			reference: {
				reference: `${book} ${chapter}:${verse}`,
				book: book,
			    chapter: chapter,
			    verse: verse,
			},
			language: language,
			version: version,
		};
	}
	if (jsonData[chapter] && jsonData[chapter][verse]) {
		return {
			content: jsonData[chapter][verse],
			reference: {
				reference: `${book} ${chapter}:${verse}`,
				book: book,
			    chapter: chapter,
			    verse: verse,
			},
			language: language,
			version: version,
		};
	}
	return {
		error: `[fetch_verse.js/ERROR] Verse not found in the data: ${filePath}\nBook: ${book}\nChapter: ${chapter}\nVerse(s): ${verse}\nReference: ${reference}\nLanguage: ${language}\nVersion: ${version}`,
	};
}

module.exports = { fetchVerse };
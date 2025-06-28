const fs = require('fs');
const path = require('path');

function parseReference(reference) {
	const parts = reference.trim().split(' ');

	let book, chapter, verse;

	if (parts.length === 3) {
		book = `${parts[0]} ${parts[1]}`.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
		chapter = parts[2].split(':')[0];
		verse = parts[2].split(':')[1];
	}
	else if (parts.length === 2) {
		book = parts[0].split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
		chapter = parts[1].split(':')[0];
		verse = parts[1].split(':')[1];
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

	if (!fs.existsSync(filePath)) return { error: 'Verse not found.' };
	const data = await fs.promises.readFile(filePath, { encoding: 'utf8' });
	const jsonData = JSON.parse(data);

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
	return { error: 'Verse not found in the data.' };
}

module.exports = { fetchVerse };
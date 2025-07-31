const bibleBooks = require('./bible/books.json');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Normalize string by lowercasing and stripping accents
function normalize(str) {
	return str.toLowerCase()
		.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
		.replace(/\s+/g, '')
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

console.log(chalk.blue(`Loaded ${Object.keys(aliasMap).length} book aliases.`));

function findAlias(input) {
	const norm = normalize(input);
	return aliasMap[norm].replace(/\s+/g, '') || input;
}

async function processDirectory(dirPath) {
	try {
		const entries = fs.readdirSync(dirPath);

		for (const entry of entries) {
			const fullPath = path.join(dirPath, entry);

			if (fs.statSync(fullPath).isDirectory()) {
				// If this is a "books" folder, normalize its contents
				if (entry === 'books') {
					console.log(chalk.blue(`Found books directory at: ${fullPath}`));
					await normalizeBookContents(fullPath);
				}
				else {
					// Otherwise, recursively search this directory
					await processDirectory(fullPath);
				}
			}
		}
	}
	catch (error) {
		console.error(chalk.red(`Error processing directory ${dirPath}:`), error);
	}
}

async function normalizeBookContents(booksPath) {
	try {
		const folders = fs.readdirSync(booksPath);

		for (const folder of folders) {
			const oldPath = path.join(booksPath, folder);

			// Skip if not a directory
			if (!fs.statSync(oldPath).isDirectory()) continue;

			const normalizedName = findAlias(folder);
			const newPath = path.join(booksPath, normalizedName);

			if (oldPath !== newPath) {
				fs.renameSync(oldPath, newPath);
				console.log(chalk.green(`Renamed: ${folder} → ${normalizedName}`));
			}
		}
		console.log(chalk.blue('Folder normalization complete for: ' + booksPath));
	}
	catch (error) {
		console.error(chalk.red('Error normalizing folders:'), error);
	}
}

// Execute if running directly
if (require.main === module) {
	const startPath = path.join(__dirname, './bible/es');
	processDirectory(startPath);
}

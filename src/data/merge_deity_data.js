const fs = require('fs');
const path = require('path');

const folkGodsNewPath = path.join(__dirname, 'folk-gods-new.json');
const folkGodsPath = path.join(__dirname, 'folk-gods.json');
const buddhistGodsNewPath = path.join(__dirname, 'buddhist-gods-new.json');
const buddhistGodsPath = path.join(__dirname, 'buddhist-gods.json');

// Helper to read JSON
function readJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
}

// Helper to write JSON
function writeJson(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully updated ${filePath}`);
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err);
    }
}

// 1. Merge Folk Gods
const folkGodsNew = readJson(folkGodsNewPath);
const folkGods = readJson(folkGodsPath);
const updatedFolkGods = [...folkGods, ...folkGodsNew];
writeJson(folkGodsPath, updatedFolkGods);

// 2. Merge Buddhist Gods
const buddhistGodsNew = readJson(buddhistGodsNewPath);
const buddhistGods = readJson(buddhistGodsPath);
const updatedBuddhistGods = [...buddhistGods, ...buddhistGodsNew];
writeJson(buddhistGodsPath, updatedBuddhistGods);

console.log('Deity data merge complete.');

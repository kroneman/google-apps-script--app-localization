const path = require('path');
const axios = require('axios');
const fse = require('fs-extra');

// Load TRANSLATION_URL from env
require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

const { TRANSLATION_URL } = process.env;
const INPUT_FILE = path.join(__dirname, './localization-files/default.json');
const OUTPUT_FILE = path.join(__dirname, './localization-files/output.json');

if (!TRANSLATION_URL) {
  console.error(
    `
      Aborting:
      have you deployed the google apps script in ./google-script and placed
      TRANSLATION_URL in the .env file at ${path.join(__dirname, '../.env')}
      It should look something like 'https://script.google.com/macros/s/89asdCKALA_a-really-long-hash/exec'
    `
  );
  return;
}

const Cache = require('./cache');
const cache = new Cache();

/**
 * So this works, however, if you exeed the rate or daily api call limit you run into an issue
 */
translateLocalizationFile();

/**
 * Main execution
 * Reads the input, translates it and saves it
 */
async function translateLocalizationFile() {
  const inputFileJSON = await fse.readJSON(INPUT_FILE);
  const translatedJSON = {};

  await cache.loadFromFile();
  const entries = Object.entries(inputFileJSON);
  
  for (const [key, value] of entries) {
    const fingerPrint = cache.fingerPrint(`${key}:${value}`);
    const translatedValue = await translate({ fingerPrint, key, text: value });
    if (translatedValue) {
      translatedJSON[key] = translatedValue;
    }
  }

  await fse.writeJSON(OUTPUT_FILE, translatedJSON);
  await cache.saveToFile();
}

/**
 * Checks if value has been processed before
 * - if it found it in cache doesn't process again
 * - this way api requests are saved
 * @param {*} param0
 */
async function translate({ text, key, fingerPrint }) {
  console.log(`translate: ${text}`);
  const isInMemory = cache.has(fingerPrint, key);
  if(isInMemory) {
    const valueInMemory = cache.get(fingerPrint, key);
    console.log(`translation from memory: ${valueInMemory}`);
    return valueInMemory;
  }

  const translation = await translateApi(text);
  console.log(`translation from api: ${translation}`);
  cache.save(fingerPrint, key, translation);
}

/**
 * Calls the endpoint api to translate
 * @param {string} text 
 */
async function translateApi(text) {
  try {
    const response = await axios.get(`${TRANSLATION_URL}?text=${encodeURIComponent(text)}`)
    const { data } = response;
    const dataIsString = (typeof data === 'string');
    if(dataIsString && data.includes('Service invoked too many times for one day')) {
      throw new Error('Rate Limit Exceeded');
    }

    if(dataIsString) {
      throw new Error('Unknown Response');
    }

    const decodedOutput = decodeURIComponent(data.output);
    return decodedOutput;
  } catch (e) {
    console.error(e);
    // if error is thrown in api request for rate limit or another error
    // save progress and exit
    await cache.saveToFile();
    process.exit(1);
  }
}
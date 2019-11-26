// Load TRANSLATION_URL from env
const path = require('path');
const axios = require('axios');
const fse = require('fs-extra');

require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

const { TRANSLATION_URL } = process.env;
const INPUT_FILE = path.join(__dirname, './localization-files/default.json');
const OUTPUT_FILE = path.join(__dirname, './localization-files/output.json');

/**
 * So this works, however, if you exeed the rate or daily api call limit you run into an issue
 */
translateLocalizationFile();

async function translateLocalizationFile() {
  const inputFileJSON = await fse.readJSON(INPUT_FILE);
  const entries = Object.entries(inputFileJSON);
  const translatedJSON = {};
  for (const [key, value] of entries) {
    const translatedValue = await googleTranslate(value);
    if (translatedValue) {
      translatedJSON[key] = translatedValue;
    }
  }

  await fse.writeJSON(OUTPUT_FILE, translatedJSON);
}

async function googleTranslate(text) {
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
    process.exit(1);
  }
}
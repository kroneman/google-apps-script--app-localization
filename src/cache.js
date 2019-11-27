const path = require('path');
const fse = require('fs-extra');
const crypto = require('crypto');

const defaultCacheFile = path.join(__dirname, './.cache.json');
const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

/**
 * - Creates a cache object in memory when process is running
 * - Uses default or passed filepath to load previous cache into memory
 * - Saves cache on SIGINT
 */
module.exports = class Cache {
  constructor(filePath) {
    this.CACHE_FILE = filePath || defaultCacheFile;
    this.fingerPrintKey = 'SomeKey';
    this.cache = {};
    // if the process is interrupted save progress to json file
    process.on('SIGINT', async () => {
      await this.saveToFile();
      process.exit();
    });
  }

  /**
   * Uses sha256 to create a fingerprint
   * further reading on why https://en.wikipedia.org/wiki/Fingerprint_(computing)
   * Lol, wikipedia
   * @param {string} dataString 
   */
  fingerPrint(dataString) {
    const hash = crypto.createHmac('sha256', this.fingerPrintKey)
                      .update(dataString)
                      .digest('hex');
    return hash;
  }

  /**
   * Checks cache if entry exists and if key of entry exists
   * Allows for multiple keys to be added in cache
   * @param {string} fingerPrint 
   * @param {string} key 
   */
  has(fingerPrint, key) {
    const fingerPrintExists = has(this.cache, fingerPrint);
    return fingerPrintExists && has(this.cache[fingerPrint], key);
  }

  /**
   * Retrieves a value from cache
   * @param {string} fingerPrint 
   * @param {string} key 
   * @returns {*} entry
   */
  get(fingerPrint, key) {
    return this.cache[fingerPrint][key];
  }

  /**
   * Saves a value to cache
   * @param {string} fingerPrint 
   * @param {string} key 
   * @param {*} result 
   */
  save(fingerPrint, key, result) {
    const fingerPrintExists = has(this.cache, fingerPrint);
    if(!fingerPrintExists) {
      this.cache[fingerPrint] = {};
    }

    this.cache[fingerPrint][key] = result;
  }

  /**
   * Loads cache from a file
   * @returns {boolean} success or failure
   */
  async loadFromFile() {
    const isValidFile = await fse.pathExists(this.CACHE_FILE);
    if(!isValidFile) {
      return false;
    }

    const fileData = await fse.readJSON(this.CACHE_FILE);
    // no deepmerge just read before starting anything, and resave when done
    this.cache = {
      ...fileData
    };
    return true
  }

  /**
   * Saves cache state to file for loading later
   * @returns {boolean} success or failure
   */
  async saveToFile() {
    if(Object.keys(this.cache).length < 1) {
      console.log('saveMemoryToFile, not enough entries to warrant saving file');
      return false;
    }

    await fse.writeJSON(this.CACHE_FILE, this.cache);
    console.log('saved memory to file');
    return true;
  }
}
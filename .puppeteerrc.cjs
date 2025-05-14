const { join } = require("path");

/**
 * @type {import('puppeteer').Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
  // Skip browser download and use system Chrome
  executablePath: "/usr/bin/google-chrome",
};

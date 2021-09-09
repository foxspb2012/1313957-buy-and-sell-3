'use strict';

const chalk = require(`chalk`);
const fs = require(`fs`).promises;
const FILENAME = `mocks.json`;
let data = [];

const getMockData = async () => {
  if (data.length > 0) {
    return data;
  }

  try {
    const fileContent = await fs.readFile(FILENAME, `utf8`);
    data = JSON.parse(fileContent);
  } catch (err) {
    console.error(chalk.red(err));
  }

  return data;
};

module.exports = getMockData;


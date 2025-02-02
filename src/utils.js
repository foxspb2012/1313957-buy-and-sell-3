'use strict';

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const shuffle = (someArray) => {
  for (let i = someArray.length - 1; i > 0; i--) {
    const randomPosition = Math.floor(Math.random() * i);
    [someArray[i], someArray[randomPosition]] = [someArray[randomPosition], someArray[i]];
  }

  return someArray;
};

const ensureArray = (value) => Array.isArray(value) ? value : [value];

const prepareErrors = (errors) => {
  return errors.response.data.split(`\n`);
};

const asyncHandler = (cb) => {
  return async function (req, res, next) {
    try {
      return await cb(req, res);
    } catch (err) {
      return next(err);
    }
  };
};

module.exports = {getRandomInt, shuffle, ensureArray, prepareErrors, asyncHandler};

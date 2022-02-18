'use strict';

module.exports = (fn) => (req, res) =>
  Promise
    .resolve(fn(req, res))
    .catch();

'use strict';
const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const {asyncHandler} = require(`../../utils`);

module.exports = (app, searchService) => {
  const route = new Router();

  app.use(`/search`, route);

  route.get(`/`, asyncHandler(async (req, res) => {
    const {query = ``} = req.query;
    if (!query) {
      res.status(HttpCode.BAD_REQUEST).json([]);
      return;
    }

    const searchResults = await searchService.findAll(query);
    const searchStatus = searchResults.length > 0 ? HttpCode.OK : HttpCode.NOT_FOUND;

    res.status(searchStatus)
      .json(searchResults);
  }));
};

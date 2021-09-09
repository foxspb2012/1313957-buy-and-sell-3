'use strict';

const {Router} = require(`express`);
const category = require(`../api/category`);
const offer = require(`../api/offer`);
const search = require(`../api/search`);
const getMockData = require(`../lib/get-mock-data`);

const router = new Router();

const getRouter = async () => {
  const {
          CategoryService,
          SearchService,
          OfferService,
          CommentService,
        } = require(`../data-service`);

  const mockData = await getMockData();

  category(router, new CategoryService(mockData));
  search(router, new SearchService(mockData));
  offer(router, new OfferService(mockData), new CommentService());

  return router;
};

module.exports = getRouter;

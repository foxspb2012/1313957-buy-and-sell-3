'use strict';

const {Router} = require(`express`);
const category = require(`../api/category`);
const offer = require(`../api/offer`);
const search = require(`../api/search`);
const getMockData = require(`../lib/get-mock-data`);

const receiveMockData = async () => {
  const {
          CategoryService,
          SearchService,
          OfferService,
          CommentService,
        } = require(`../data-service`);

  const app = new Router();
  const mockData = await getMockData();

  category(app, new CategoryService(mockData));
  search(app, new SearchService(mockData));
  offer(app, new OfferService(mockData), new CommentService());
};

module.exports = receiveMockData;

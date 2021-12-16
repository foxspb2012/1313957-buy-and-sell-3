'use strict';

const {Router} = require(`express`);
const category = require(`../api/category`);
const offer = require(`../api/offer`);
const search = require(`../api/search`);
const comment = require(`../api/comment`);

const sequelize = require(`../lib/sequelize`);
const defineModels = require(`../models`);

const router = new Router();

defineModels(sequelize);

const getRouter = async () => {
  const {
    CategoryService,
    SearchService,
    OfferService,
    CommentService,
  } = require(`../data-service`);

  category(router, new CategoryService(sequelize));
  search(router, new SearchService(sequelize));
  offer(router, new OfferService(sequelize));
  comment(router, new OfferService(sequelize), new CommentService(sequelize));

  return router;
};

module.exports = getRouter;

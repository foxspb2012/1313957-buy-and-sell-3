'use strict';

const {Router} = require(`express`);
const category = require(`../api/category`);
const offer = require(`../api/offer`);
const search = require(`../api/search`);
const comment = require(`../api/comment`);
const user = require(`../api/user`);

const {
  CategoryService,
  SearchService,
  OfferService,
  CommentService,
  UserService
} = require(`../data-service`);

const sequelize = require(`../lib/sequelize`);
const defineModels = require(`../models`);

const router = new Router();

defineModels(sequelize);

(() => {
  category(router, new CategoryService(sequelize));
  search(router, new SearchService(sequelize));
  offer(router, new OfferService(sequelize));
  comment(router, new OfferService(sequelize), new CommentService(sequelize));
  user(router, new UserService(sequelize));
})();

module.exports = router;

'use strict';
module.exports = (app, service) => {
  const {Router} = require(`express`);
  const {HttpCode} = require(`../../constants`);
  const route = new Router();

  app.use(`/category`, route);

  route.get(`/`, async (req, res) => {
    const categories = await service.findAll();
    res.status(HttpCode.OK)
      .json(categories);
  });
};

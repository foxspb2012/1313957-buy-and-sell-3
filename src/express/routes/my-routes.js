'use strict';

const {Router} = require(`express`);
const auth = require(`../middlewares/auth`);
const api = require(`../api`).getAPI();
const {asyncHandler} = require(`../../utils`);

const myRouter = new Router();

myRouter.use(auth);

myRouter.get(`/`, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const offers = await api.getOffers({userId: user.id});
  res.render(`my-tickets`, {user, offers, publication: true});
}));

myRouter.get(`/comments`, asyncHandler(async (req, res) => {
  const {user} = req.session;

  const offers = await api.getOffers({userId: user.id, withComments: true});

  res.render(`comments`, {user, offers, comments: true});
}));

module.exports = myRouter;

'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();
const upload = require(`../middlewares/upload`);
const {prepareErrors, asyncHandler} = require(`../../utils`);
const {OFFERS_PER_PAGE} = require(`../../constants`);

const mainRouter = new Router();

mainRouter.get(`/`, async (req, res) => {
  const {user} = req.session;

  const limit = OFFERS_PER_PAGE;

  const [offers, categories] = await Promise.all([
    api.getOffers({limit}),
    api.getCategories({withCount: true})
  ]);

  res.render(`main`, {offers, categories, user});
});

mainRouter.get(`/register`, (req, res) => {
  const {user} = req.session;

  res.render(`sign-up`, {user});
});

mainRouter.post(`/register`, upload.single(`avatar`), asyncHandler(async (req, res) => {
  const {body, file} = req;

  const userData = {
    avatar: file ? file.filename : ``,
    name: body[`user-name`],
    email: body[`user-email`],
    password: body[`user-password`],
    passwordRepeated: body[`user-password-again`]
  };

  try {
    await api.createUser({data: userData});

    res.redirect(`/login`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;

    res.render(`sign-up`, {user, userData, validationMessages});
  }
}));

mainRouter.get(`/login`, (req, res) => {
  const {user} = req.session;

  res.render(`login`, {user});
});

mainRouter.post(`/login`, asyncHandler(async (req, res) => {
  const email = req.body[`user-email`];
  const password = req.body[`user-password`];

  try {
    const user = await api.auth({email, password});

    req.session.user = user;
    req.session.save(() => {
      res.redirect(`/`);
    });
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;

    res.render(`login`, {user, validationMessages});
  }
}));

mainRouter.get(`/logout`, (req, res) => {
  req.session.destroy(
      () => res.redirect(`/`)
  );
});

mainRouter.get(`/search`, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {query} = req.query;

  const limit = OFFERS_PER_PAGE;

  const offers = await api.getOffers({limit});

  if (!query) {
    return res.render(`search-result`, {
      query: ``,
      result: [],
      offers,
      user
    });
  }

  try {
    const result = await api.search({query});

    return res.render(`search-result`, {
      query,
      result,
      offers,
      user
    });
  } catch (error) {
    return res.render(`search-result`, {
      query,
      result: [],
      offers,
      user
    });
  }
}));

module.exports = mainRouter;

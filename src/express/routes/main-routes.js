'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();
const upload = require(`../middlewares/upload`);
const {prepareErrors} = require(`../../utils`);

const OFFERS_PER_PAGE = 8;

const mainRouter = new Router();

mainRouter.get(`/`, async (req, res) => {

  const {user} = req.session;

  // получаем номер страницы
  let {page = 1} = req.query;
  page = +page;

  // количество запрашиваемых объявлений равно количеству объявлений на странице
  const limit = OFFERS_PER_PAGE;

  // количество объявлений, которое нам нужно пропустить - это количество объявлений на предыдущих страницах
  const offset = (page - 1) * OFFERS_PER_PAGE;
  const [
    {count, offers},
    categories
  ] = await Promise.all([
    api.getOffers({limit, offset}),
    api.getCategories(true)
  ]);

  // количество страниц — это общее количество объявлений, поделённое на количество объявлений на странице (с округлением вверх)
  const totalPages = Math.ceil(count / OFFERS_PER_PAGE);

  // передадим все эти данные в шаблон
  res.render(`main`, {offers, categories, page, totalPages, user});
});

mainRouter.get(`/register`, (req, res) => {
  const {user} = req.session;
  res.render(`sign-up`, {user});
});

mainRouter.post(`/register`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const userData = {
    avatar: file ? file.filename : ``,
    name: body[`user-name`],
    email: body[`user-email`],
    password: body[`user-password`],
    passwordRepeated: body[`user-password-again`]
  };
  try {
    await api.createUser(userData);
    res.redirect(`/login`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;
    res.render(`sign-up`, {user, validationMessages});
  }
});

mainRouter.get(`/login`, (req, res) => {
  const {user} = req.session;
  res.render(`login`, {user});
});

mainRouter.post(`/login`, async (req, res) => {
  try {
    const user = await api.auth(req.body[`user-email`], req.body[`user-password`]);
    req.session.user = user;
    req.session.save(() => {
      res.redirect(`/`);
    });
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;
    res.render(`login`, {user, validationMessages});
  }
});

mainRouter.get(`/logout`, (req, res) => {
  req.session.destroy(() => res.redirect(`/`));
});

mainRouter.get(`/search`, async (req, res) => {
  const {user} = req.session;
  try {
    const {search} = req.query;
    const results = await api.search(search);

    res.render(`search-result`, {
      results,
      user
    });
  } catch (error) {
    res.render(`search-result`, {
      results: [],
      user
    });
  }
});

module.exports = mainRouter;

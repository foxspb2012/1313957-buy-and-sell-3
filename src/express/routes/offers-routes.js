'use strict';

const {Router} = require(`express`);
const csrf = require(`csurf`);
const api = require(`../api`).getAPI();
const {ensureArray, prepareErrors, asyncHandler} = require(`../../utils`);
const upload = require(`../middlewares/upload`);
const auth = require(`../middlewares/auth`);
const {HttpCode, OFFERS_PER_PAGE} = require(`../../constants`);

const offersRouter = new Router();

const csrfProtection = csrf();

const getAddOfferData = () => {
  return api.getCategories({withCount: false});
};

const getEditOfferData = asyncHandler(async ({id, userId}) => {
  const [offer, categories] = await Promise.all([
    api.getOffer({id, userId, withComments: false}),
    api.getCategories({withCount: false})
  ]);
  return [offer, categories];
});

const getViewOfferData = ({id}) => {
  return api.getOffer({id, withComments: true});
};

offersRouter.get(`/category/:categoryId`, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {categoryId} = req.params;

  let {page = 1} = req.query;
  page = +page;

  const limit = OFFERS_PER_PAGE;
  const offset = (page - 1) * OFFERS_PER_PAGE;

  const [categories, {category, count, offersByCategory}] = await Promise.all([
    api.getCategories({withCount: true}),
    api.getCategory({categoryId, limit, offset})
  ]);

  const totalPages = Math.ceil(count / OFFERS_PER_PAGE);

  const offers = {
    category,
    current: offersByCategory
  };

  res.render(`category`, {
    fullView: true,
    categories,
    count,
    offers,
    page,
    totalPages,
    user
  });
}));

offersRouter.get(`/add`, auth, csrfProtection, asyncHandler(async (req, res) => {
  const {user} = req.session;

  try {
    const categories = await getAddOfferData();
    res.render(`offers/new-ticket`, {user, categories, csrfToken: req.csrfToken()});
  } catch (error) {
    res.render(`errors/400`);
  }
}));

offersRouter.post(`/add`, auth, upload.single(`avatar`), csrfProtection, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;

  const offerData = {
    picture: file ? file.filename : ``,
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category),
    userId: user.id
  };
  try {
    await api.createOffer({data: offerData});

    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const categories = await getAddOfferData();

    res.render(`offers/new-ticket`, {categories, user, validationMessages, csrfToken: req.csrfToken()});
  }
}));

offersRouter.get(`/edit/:id`, auth, csrfProtection, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    const [offer, categories] = await getEditOfferData({id, userId: user.id});

    res.render(`offers/ticket-edit`, {id, offer, categories, user, csrfToken: req.csrfToken()});
  } catch (error) {
    res.render(`errors/400`);
  }
}));

offersRouter.post(`/edit/:id`, auth, upload.single(`avatar`), csrfProtection, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {body, file} = req;
  const {id} = req.params;

  const offerData = {
    picture: file ? file.filename : body[`old-image`],
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category),
    userId: user.id
  };

  try {
    await api.editOffer({id, data: offerData});

    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const [offer, categories] = await getEditOfferData({id});

    res.render(`offers/ticket-edit`, {id, offer, categories, validationMessages, user, csrfToken: req.csrfToken()});
  }
}));

offersRouter.get(`/:id`, csrfProtection, asyncHandler(async (req, res)=> {
  const {user} = req.session;
  const {id} = req.params;

  const offer = await getViewOfferData({id});
  res.render(`offers/ticket`, {offer, id, user, csrfToken: req.csrfToken()});
}));

offersRouter.delete(`/:id`, auth, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;

  try {
    const offer = await api.removeOffer({id, userId: user.id});

    res.status(HttpCode.OK).send(offer);
  } catch (errors) {
    res.status(errors.response.status).send(errors.response.statusText);
  }
}));

offersRouter.post(`/:id/comments`, auth, csrfProtection, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {id} = req.params;
  const {comment} = req.body;

  const commentData = {
    userId: user.id,
    text: comment
  };

  const limit = OFFERS_PER_PAGE;

  try {
    await api.createComment({id, data: commentData, limit});

    res.redirect(`/offers/${id}`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const offer = await getViewOfferData({id});

    res.render(`offers/ticket`, {offer, id, validationMessages, user, csrfToken: req.csrfToken()});
  }
}));

offersRouter.delete(`/:id/comments/:commentId`, auth, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {id, commentId} = req.params;

  const limit = OFFERS_PER_PAGE;

  try {
    const comment = await api.removeComment({id, userId: user.id, commentId, limit});
    res.status(HttpCode.OK).send(comment);
  } catch (errors) {
    res.status(errors.response.status).send(errors.response.statusText);
  }
}));

module.exports = offersRouter;

'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();
const {ensureArray, prepareErrors} = require(`../../utils`);
const upload = require(`../middlewares/multer-upload`);

const offersRouter = new Router();

const getAddOfferData = () => {
  return api.getCategories();
};

const getEditOfferData = async (offerId) => {
  const [offer, categories] = await Promise.all([
    api.getOffer(offerId),
    api.getCategories()
  ]);
  return [offer, categories];
};

const getViewOfferData = (offerId, comments) => {
  return api.getOffer(offerId, comments);
};

offersRouter.get(`/category/:id`, (req, res)=> res.render(`category`));

offersRouter.get(`/add`, async (req, res) => {
  try {
    const categories = await getAddOfferData();
    res.render(`offers/new-ticket`, {categories});
  } catch (error) {
    res.render(`errors/400`);
  }
});

offersRouter.post(`/add`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const offerData = {
    picture: file ? file.filename : ``,
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category)
  };
  try {
    await api.createOffer(offerData);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const categories = await getAddOfferData();
    res.render(`offers/new-ticket`, {categories, validationMessages});
  }
});

offersRouter.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  try {
    const [offer, categories] = await getEditOfferData(id);
    res.render(`offers/ticket-edit`, {id, offer, categories});
  } catch (error) {
    res.render(`errors/400`);
  }
});

offersRouter.post(`/edit/:id`, upload.single(`avatar`), async (req, res) => {
  const {body, file} = req;
  const {id} = req.params;
  const offerData = {
    picture: file ? file.filename : body[`old-image`],
    sum: body.price,
    type: body.action,
    description: body.comment,
    title: body[`ticket-name`],
    categories: ensureArray(body.category)
  };

  try {
    await api.editOffer(id, offerData);
    res.redirect(`/my`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const [offer, categories] = await getEditOfferData(id);
    res.render(`offers/ticket-edit`, {id, offer, categories, validationMessages});
  }
});

offersRouter.get(`/:id`, async (req, res)=> {
  const {id} = req.params;
  const offer = await getViewOfferData(id, true);
  res.render(`offers/ticket`, {offer, id});
});

offersRouter.post(`/:id/comments`, async (req, res) => {
  const {id} = req.params;
  const {comment} = req.body;
  try {
    await api.createComment(id, {text: comment});
    res.redirect(`/offers/${id}`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const offer = await getViewOfferData(id, true);
    res.render(`offers/ticket`, {offer, id, validationMessages});
  }
});

module.exports = offersRouter;

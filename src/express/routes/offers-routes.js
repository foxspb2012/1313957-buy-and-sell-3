'use strict';

const {Router} = require(`express`);
const api = require(`../api`).getAPI();
const {ensureArray} = require(`../../utils`);
const upload = require(`../middlewares/multer-upload`);

const offersRouter = new Router();

offersRouter.get(`/category/:id`, (req, res)=> res.render(`category`));

offersRouter.get(`/add`, async (req, res) => {
  try {
    const categories = await api.getCategories();
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
  } catch (error) {
    res.redirect(`back`);
  }
});

offersRouter.get(`/edit/:id`, async (req, res) => {
  const {id} = req.params;
  try {
    const [offer, categories] = await Promise.all([
      api.getOffer(id),
      api.getCategories()
    ]);
    res.render(`offers/ticket-edit`, {offer, categories});
  } catch (error) {
    res.render(`errors/400`);
  }
});

offersRouter.get(`/:id`, async (req, res)=> {
  const {id} = req.params;
  const offer = await api.getOffer(id, true);
  res.render(`offers/ticket`, {offer});
});

module.exports = offersRouter;

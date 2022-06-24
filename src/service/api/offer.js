'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const offerValidator = require(`../middlewares/offer-validator`);
const routeParamsValidator = require(`../middlewares/route-params-validator`);
const {adaptToClient} = require(`../lib/adapt-to-client`);
const {asyncHandler} = require(`../../utils`);

module.exports = (app, offerService) => {
  const route = new Router();

  app.use(`/offers`, route);

  route.get(`/`, asyncHandler(async (req, res) => {
    const {limit, offset, userId, categoryId, withComments} = req.query;

    let offers = {};

    if (userId) {
      offers.current = await offerService.findAll({userId, withComments});
      return res.status(HttpCode.OK).json(offers);
    }

    if (categoryId) {
      offers.current = await offerService.findPage({limit, offset, categoryId});
    } else {
      offers.recent = await offerService.findLimit({limit});
      offers.commented = await offerService.findLimit({limit, withComments: true});
    }
    return res.status(HttpCode.OK).json(offers);
  }));

  route.get(`/:offerId`, routeParamsValidator, asyncHandler(async (req, res) => {
    const {offerId} = req.params;
    const {userId, withComments} = req.query;

    const offer = await offerService.findOne({offerId, userId, withComments});

    if (!offer) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found with ${offerId}`);
    }

    return res.status(HttpCode.OK)
      .json(offer);
  }));

  route.post(`/`, offerValidator, asyncHandler(async (req, res) => {
    const data = await offerService.create(req.body);

    const adaptedOffer = adaptToClient(await offerService.findOne({offerId: data.id}));

    const io = req.app.locals.socketio;
    io.emit(`offer:create`, adaptedOffer);

    return res.status(HttpCode.CREATED)
      .json(data);
  }));

  route.put(`/:offerId`, [routeParamsValidator, offerValidator], asyncHandler(async (req, res) => {
    const {offerId} = req.params;
    const updated = await offerService.update({id: offerId, offer: req.body});
    const {limit} = req.query;

    if (!updated) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found with ${offerId}`);
    }

    const [offers, offersCommented] = await Promise.all([
      offerService.findLimit({limit}),
      offerService.findLimit({limit, withComments: true})
    ]);

    const io = req.app.locals.socketio;
    io.emit(`offer:update`, offers, offersCommented);

    return res.status(HttpCode.OK)
      .send(`Updated`);
  }));

  route.delete(`/:offerId`, routeParamsValidator, asyncHandler(async (req, res) => {
    const {offerId} = req.params;
    const {userId} = req.body;
    const {limit} = req.query;

    const offer = await offerService.findOne({offerId});

    if (!offer) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }

    const deletedOffer = await offerService.drop({userId, offerId});

    if (!deletedOffer) {
      return res.status(HttpCode.FORBIDDEN)
        .send(`Forbidden`);
    }

    const [offers, offersCommented] = await Promise.all([
      offerService.findLimit({limit}),
      offerService.findLimit({limit, withComments: true})
    ]);

    const io = req.app.locals.socketio;
    io.emit(`offer:delete`, offers, offersCommented);

    return res.status(HttpCode.OK)
      .json(deletedOffer);
  }));
};

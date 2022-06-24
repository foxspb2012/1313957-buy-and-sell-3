'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const offerExist = require(`../middlewares/offer-exists`);
const commentValidator = require(`../middlewares/comment-validator`);
const routeParamsValidator = require(`../middlewares/route-params-validator`);
const {asyncHandler} = require(`../../utils`);

module.exports = (app, offerService, commentService) => {
  const route = new Router();

  app.use(`/offers`, route);

  route.get(`/:offerId/comments`, [routeParamsValidator, offerExist(offerService)], asyncHandler(async (req, res) => {
    const {offerId} = req.params;
    const comments = await commentService.findAll(offerId);

    res.status(HttpCode.OK)
      .json(comments);

  }));

  route.post(`/:offerId/comments`, [routeParamsValidator, offerExist(offerService), commentValidator], asyncHandler(async (req, res) => {
    const {offerId} = req.params;
    const {limit} = req.query;
    const comment = commentService.create(offerId, req.body);

    const offersCommented = await offerService.findLimit({limit, withComments: true});

    const io = req.app.locals.socketio;
    io.emit(`comment:create`, offersCommented);

    return res.status(HttpCode.CREATED)
      .json(comment);
  }));

  route.delete(`/:offerId/comments/:commentId`, [routeParamsValidator, offerExist(offerService)], asyncHandler(async (req, res) => {
    const {offerId, commentId} = req.params;
    const {userId} = req.body;
    const {limit} = req.query;

    const comment = await commentService.findOne(commentId, offerId);

    if (!comment) {
      return res.status(HttpCode.NOT_FOUND)
        .send(`Not found`);
    }
    const deletedComment = await commentService.drop(userId, offerId, commentId);

    if (!deletedComment) {
      return res.status(HttpCode.FORBIDDEN)
        .send(`Forbidden`);
    }

    const offersCommented = await offerService.findLimit({limit, withComments: true});

    const io = req.app.locals.socketio;
    io.emit(`comment:delete`, offersCommented);

    return res.status(HttpCode.OK)
      .json(deletedComment);
  }));
};

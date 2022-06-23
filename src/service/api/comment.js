'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);
const offerExist = require(`../middlewares/offer-exists`);
const commentValidator = require(`../middlewares/comment-validator`);
const routeParamsValidator = require(`../middlewares/route-params-validator`);

module.exports = (app, offerService, commentService) => {
  const route = new Router();

  app.use(`/offers`, route);

  route.get(`/:offerId/comments`, [routeParamsValidator, offerExist(offerService)], async (req, res) => {
    const {offerId} = req.params;
    const comments = await commentService.findAll(offerId);

    res.status(HttpCode.OK)
      .json(comments);

  });

  route.delete(`/:offerId/comments/:commentId`, [routeParamsValidator, offerExist(offerService)], async (req, res) => {
    const {offerId, commentId} = req.params;
    const {userId} = req.body;

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

    return res.status(HttpCode.OK)
      .json(deletedComment);
  });

  route.post(`/:offerId/comments`, [routeParamsValidator, offerExist(offerService), commentValidator], (req, res) => {
    const {offerId} = req.params;
    const comment = commentService.create(offerId, req.body);

    return res.status(HttpCode.CREATED)
      .json(comment);
  });
};

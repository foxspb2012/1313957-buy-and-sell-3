'use strict';

const CategoryModel = require(`./category`);
const CommentModel = require(`./comment`);
const OfferModel = require(`./offer`);
const OfferCategoryModel = require(`./offer-category`);

const define = (sequelize) => {
  const Offer = OfferModel.define(sequelize);
  const Category = CategoryModel.define(sequelize);
  const OfferCategory = OfferCategoryModel.define(sequelize);
  const Comment = CommentModel.define(sequelize);

  [OfferModel, CategoryModel, CommentModel].forEach((model) => model.defineRelations({
    Offer,
    Category,
    OfferCategory,
    Comment
  }));

  return {Category, Comment, Offer, OfferCategory};
};

module.exports = define;

'use strict';

const CategoryModel = require(`./category`);
const CommentModel = require(`./comment`);
const OfferModel = require(`./offer`);
const OfferCategoryModel = require(`./offer-category`);
const UserModel = require(`./user`);

const define = (sequelize) => {
  const Offer = OfferModel.define(sequelize);
  const Category = CategoryModel.define(sequelize);
  const OfferCategory = OfferCategoryModel.define(sequelize);
  const Comment = CommentModel.define(sequelize);
  const User = UserModel.define(sequelize);

  [OfferModel, CategoryModel, CommentModel, UserModel].forEach((model) => model.defineRelations({
    Offer,
    Category,
    OfferCategory,
    Comment,
    User
  }));

  return {Category, Comment, Offer, OfferCategory, User};
};

module.exports = define;

'use strict';

const {Model} = require(`sequelize`);

class OfferCategoryModel extends Model {

}

const define = (sequelize) => OfferCategoryModel.init({

}, {
  sequelize,
  modelName: `OfferCategory`,
  tableName: `offerCategory`
});

module.exports = {define};

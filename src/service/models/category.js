'use strict';

const {DataTypes, Model} = require(`sequelize`);
const Aliase = require(`./aliase`);

class CategoryModel extends Model {

}

const define = (sequelize) => CategoryModel.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: `Category`,
  tableName: `categories`
});

const defineRelations = ({Offer, Category, OfferCategory}) => {
  Category.belongsToMany(Offer, {through: OfferCategory, as: Aliase.OFFERS});
  Category.hasMany(OfferCategory, {as: Aliase.OFFER_CATEGORIES});
};

module.exports = {define, defineRelations};

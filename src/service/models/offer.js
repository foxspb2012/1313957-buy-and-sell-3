'use strict';

const {DataTypes, Model} = require(`sequelize`);
const Aliase = require(`./aliase`);

class OfferModel extends Model {

}

const define = (sequelize) => OfferModel.init({
  description: {
    // eslint-disable-next-line new-cap
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  picture: DataTypes.STRING,
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sum: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: `Offer`,
  tableName: `offers`
});

const defineRelations = ({Offer, Category, OfferCategory, Comment}) => {
  Offer.hasMany(Comment, {as: Aliase.COMMENTS, foreignKey: `offerId`, onDelete: `cascade`});
  Offer.belongsToMany(Category, {through: OfferCategory, as: Aliase.CATEGORIES});

};

module.exports = {define, defineRelations};

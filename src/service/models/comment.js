'use strict';

const {DataTypes, Model} = require(`sequelize`);

class CommentModel extends Model {

}

const define = (sequelize) => CommentModel.init({
  text: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: `Comment`,
  tableName: `comments`
});

const defineRelations = ({Offer, Comment}) => {
  Comment.belongsTo(Offer, {foreignKey: `offerId`});
};

module.exports = {define, defineRelations};

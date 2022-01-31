'use strict';

const {DataTypes, Model} = require(`sequelize`);
const Aliase = require(`./aliase`);

class UserModel extends Model {

}

const define = (sequelize) => UserModel.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: `User`,
  tableName: `users`
});

const defineRelations = ({User, Offer, Comment}) => {
  User.hasMany(Offer, {as: Aliase.OFFERS, foreignKey: `userId`});
  Offer.belongsTo(User, {as: Aliase.USERS, foreignKey: `userId`});

  User.hasMany(Comment, {as: Aliase.COMMENTS, foreignKey: `userId`});
  Comment.belongsTo(User, {as: Aliase.USERS, foreignKey: `userId`});
};

module.exports = {define, defineRelations};

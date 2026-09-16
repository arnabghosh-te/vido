'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TokenTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TokenTransaction.init({
    userId: DataTypes.INTEGER,
    subscriptionId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    balanceAfter: DataTypes.INTEGER,
    referenceType: DataTypes.STRING,
    referenceId: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TokenTransaction',
  });
  return TokenTransaction;
};
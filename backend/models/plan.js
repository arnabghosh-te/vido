'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
   static associate(models) {
  Plan.hasMany(models.Subscription, {
    foreignKey: 'subscriptionPlanId',
    as: 'subscriptions'
  });
}
  }
  Plan.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.FLOAT,
    tokensIncluded: DataTypes.INTEGER,
    durationInDays: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Plan',
  });
  return Plan;
};
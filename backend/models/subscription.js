'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Subscription.belongsTo(models.Plan, {
        foreignKey: 'subscriptionPlanId',
        as: 'plan'
      });
    }
  }

  Subscription.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      subscriptionPlanId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      startDate: {
        type: DataTypes.DATE,
        allowNull: false
      },

      endDate: {
        type: DataTypes.DATE,
        allowNull: false
      },

      allocatedTokens: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      remainingTokens: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      usedTokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      status: {
        type: DataTypes.ENUM(
          'ACTIVE',
          'EXPIRED',
          'CANCELLED',
          'UPGRADED'
        ),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },

      stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true
      },

      stripeCheckoutSessionId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },

      stripePaymentIntentId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      }
    },
    {
      sequelize,
      modelName: 'Subscription',
      tableName: 'Subscriptions'
    }
  );

  return Subscription;
};
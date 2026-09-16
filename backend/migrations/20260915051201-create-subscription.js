'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      subscriptionPlanId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },

      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },

      allocatedTokens: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      remainingTokens: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      usedTokens: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      status: {
        type: Sequelize.ENUM(
          'ACTIVE',
          'EXPIRED',
          'CANCELLED',
          'UPGRADED'
        ),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },

      stripeCustomerId: {
        type: Sequelize.STRING,
        allowNull: true
      },

      stripeCheckoutSessionId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },

      stripePaymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Subscriptions');

    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Subscriptions_status";'
    );
  }
};
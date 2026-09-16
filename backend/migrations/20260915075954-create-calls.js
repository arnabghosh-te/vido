'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Calls', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      callerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      receiverId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      roomName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      status: {
        type: Sequelize.ENUM(
          'RINGING',
          'ACTIVE',
          'COMPLETED',
          'CANCELLED',
          'FAILED'
        ),
        allowNull: false,
        defaultValue: 'RINGING',
      },

      startedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      endedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      durationSeconds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      callerTokensUsed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      receiverTokensUsed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      transcript: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      summary: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Calls');
  },
};
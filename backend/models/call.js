'use strict';

module.exports = (sequelize, DataTypes) => {
  const Call = sequelize.define(
    'Call',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      callerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      roomName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      status: {
        type: DataTypes.ENUM(
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
        type: DataTypes.DATE,
        allowNull: true,
      },

      endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      durationSeconds: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      callerTokensUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      receiverTokensUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      transcript: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'Calls',
      timestamps: true,
    }
  );

  Call.associate = (models) => {
    Call.belongsTo(models.User, {
      foreignKey: 'callerId',
      as: 'caller',
    });

    Call.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver',
    });
  };

  return Call;
};
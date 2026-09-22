"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DocumentChat extends Model {
    static associate(models) {
      DocumentChat.belongsTo(models.Document, {
        foreignKey: "documentId",
        as: "document",
      });
      DocumentChat.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  DocumentChat.init(
    {
      documentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DocumentChat",
    }
  );
  return DocumentChat;
};

"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      Document.hasMany(models.DocumentChat, {
        foreignKey: "documentId",
        as: "chats",
      });
    }
  }
  Document.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      geminiFileUri: {
        type: DataTypes.STRING,
        allowNull: true, // Populated after first upload to Gemini File API
      },
      geminiFileName: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: "Document",
    }
  );
  return Document;
};

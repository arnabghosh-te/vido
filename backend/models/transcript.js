module.exports = (sequelize, DataTypes) => {
  const Transcript = sequelize.define(
    "Transcript",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      callId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fullText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: "en",
      },
    },
    {
      tableName: "Transcripts",
      timestamps: true,
    }
  );

  Transcript.associate = (models) => {
    Transcript.belongsTo(models.Call, {
      foreignKey: "callId",
      as: "call",
    });
    Transcript.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "creator",
    });
    Transcript.hasMany(models.TranscriptSegment, {
      foreignKey: "transcriptId",
      as: "segments",
    });
  };

  return Transcript;
};

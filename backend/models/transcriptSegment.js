module.exports = (sequelize, DataTypes) => {
  const TranscriptSegment = sequelize.define(
    "TranscriptSegment",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      transcriptId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      speakerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: "en",
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "TranscriptSegments",
      timestamps: true,
    }
  );

  TranscriptSegment.associate = (models) => {
    TranscriptSegment.belongsTo(models.Transcript, {
      foreignKey: "transcriptId",
      as: "transcript",
    });
    TranscriptSegment.belongsTo(models.User, {
      foreignKey: "speakerId",
      as: "speaker",
    });
  };

  return TranscriptSegment;
};

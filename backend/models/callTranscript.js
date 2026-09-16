module.exports = (sequelize, DataTypes) => {
  const CallTranscript = sequelize.define(
    "CallTranscript",
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

      speakerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      speakerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      endedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "CallTranscripts",
      timestamps: true,
    }
  );

  return CallTranscript;
};
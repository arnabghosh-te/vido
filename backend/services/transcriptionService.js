const { Transcript, TranscriptSegment, Call } = require("../models");

const appendTranscript = async (callId, speakerId, text, language) => {
  let transcript = await Transcript.findOne({ where: { callId } });

  if (!transcript) {
    const call = await Call.findByPk(callId);
    if (!call) throw new Error("Call not found");

    transcript = await Transcript.create({
      callId,
      createdBy: call.callerId, 
      title: `Transcript for Call ${callId}`,
      fullText: "",
      language: language || "en",
    });
  }

  // Create the segment
  const segment = await TranscriptSegment.create({
    transcriptId: transcript.id,
    speakerId: speakerId,
    text: text,
    language: language || "en",
    startTime: new Date(),
    endTime: new Date()
  });

  // Append to fullText
  const updatedFullText = transcript.fullText + `\n[Speaker ${speakerId}]: ${text}`;
  await transcript.update({ fullText: updatedFullText });

  return segment;
};

module.exports = {
  appendTranscript,
};
